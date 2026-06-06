import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { ChromaClient } from 'chromadb'
import { prisma } from '../prisma/client'

const COLLECTION_NAME = 'menu_embeddings'
let chromaClient: ChromaClient | null = null
let collection: Awaited<ReturnType<ChromaClient['getOrCreateCollection']>> | null = null

function getEmbeddings() {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: process.env.GEMINI_EMBEDDING_MODEL ?? 'text-embedding-004',
  })
}

async function getCollection() {
  if (!chromaClient) {
    chromaClient = new ChromaClient()
  }
  if (!collection) {
    collection = await chromaClient.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { 'hnsw:space': 'cosine' },
    })
  }
  return collection
}

export async function embedText(text: string): Promise<number[]> {
  const embeddings = getEmbeddings()
  const result = await embeddings.embedQuery(text)
  return result
}

export async function indexMenuItem(item: {
  id: string
  name: string
  description?: string | null
  tags: string[]
  category: string
}) {
  const text = [item.name, item.description, item.tags.join(' '), item.category]
    .filter(Boolean)
    .join(' ')
  const embedding = await embedText(text)
  const col = await getCollection()
  await col.upsert({
    ids: [item.id],
    embeddings: [embedding],
    metadatas: [
      {
        name: item.name,
        category: item.category,
        tags: item.tags.join(','),
      },
    ],
    documents: [text],
  })
}

export async function reindexAllMenuItems() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Embeddings] GEMINI_API_KEY missing — skipping reindex')
    return
  }
  const items = await prisma.menuItem.findMany()
  console.log(`[Embeddings] Reindexing ${items.length} menu items...`)
  for (const item of items) {
    await indexMenuItem(item)
  }
  console.log('[Embeddings] Reindex complete')
}

export async function chromaSearch(
  query: string,
  filters?: Record<string, unknown>
): Promise<
  Array<{
    id: string
    name: string
    category: string
    score: number
  }>
> {
  const col = await getCollection()
  const count = await col.count()
  if (count === 0) {
    await reindexAllMenuItems()
  }

  const queryEmbedding = await embedText(query)
  const results = await col.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 10,
    where: filters as Record<string, string> | undefined,
  })

  const ids = results.ids[0] ?? []
  const distances = results.distances?.[0] ?? []
  const metadatas = results.metadatas?.[0] ?? []

  return ids.map((id, i) => ({
    id,
    name: (metadatas[i]?.name as string) ?? '',
    category: (metadatas[i]?.category as string) ?? '',
    score: 1 - (distances[i] ?? 1),
  }))
}
