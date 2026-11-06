/**
 * CodeVault AI Engine — Direct Cloud & Heuristic Intelligence Service
 *
 * Powers code recommendations, explanations, oral viva generation, and smart analysis.
 * Automatically tries backend endpoint first, falls back to direct high-speed REST AI calls,
 * and maintains deep algorithmic heuristics so the user is NEVER blocked.
 */
import api from './api'

const getAiApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY || ''
}

const AI_MODEL = 'gemini-2.5-flash'

/**
 * Direct call to Cloud AI generateContent endpoint
 */
const callDirectAi = async (prompt: string, systemInstruction?: string): Promise<string> => {
  const apiKey = getAiApiKey()
  if (!apiKey) {
    throw new Error('AI API Key is not configured')
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${apiKey}`

  const body: any = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  }

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`AI API call failed with status ${response.status}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) {
    throw new Error('Empty response from AI')
  }

  return rawText
}

/**
 * Extracts and parses JSON from markdown-fenced text
 */
const parseJsonFromResponse = (text: string): any => {
  const clean = text.trim()
  const jsonMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const candidate = jsonMatch ? jsonMatch[1].trim() : clean

  try {
    return JSON.parse(candidate)
  } catch {
    // Try finding the first '{' and last '}'
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(candidate.substring(start, end + 1))
    }
    throw new Error('Unable to parse JSON from AI response')
  }
}

/**
 * Deep algorithmic heuristic analyzer for offline / instant recommendation
 */
export const analyzeCodeLocally = (code: string, language?: string) => {
  const codeLower = (code || '').toLowerCase()
  const lang = (language || 'cpp').toLowerCase()

  let title = 'Algorithm Implementation'
  let topic = 'Data Structures & Algorithms'
  let timeComplexity = 'O(n)'
  let spaceComplexity = 'O(1)'
  let aim = 'To implement, verify, and evaluate the algorithm with optimal complexity.'
  let sampleInput = 'Standard array or test inputs'
  let expectedOutput = 'Verified and formatted algorithm output'
  const recommendations: string[] = []

  // Algorithm identification
  if (codeLower.includes('bubble') && (codeLower.includes('sort') || codeLower.includes('swap'))) {
    title = 'Bubble Sort Algorithm'
    topic = 'Sorting Algorithms'
    timeComplexity = 'O(n²)'
    spaceComplexity = 'O(1)'
    aim = 'To implement and demonstrate Bubble Sort by iteratively swapping adjacent elements.'
    sampleInput = 'Arr = [64, 34, 25, 12, 22, 11, 90]'
    expectedOutput = 'Sorted Arr = [11, 12, 22, 25, 34, 64, 90]'
    recommendations.push(
      'Add an early-exit flag `swapped` to achieve O(n) best-case time complexity on already sorted arrays.',
      'Document loop invariants for outer and inner passes to aid oral viva preparation.',
      'Handle edge cases like 0 elements or single-element arrays before starting passes.'
    )
  } else if (codeLower.includes('quick') || (codeLower.includes('pivot') && codeLower.includes('partition'))) {
    title = 'Quick Sort with Partitioning'
    topic = 'Divide and Conquer'
    timeComplexity = 'O(n log n)'
    spaceComplexity = 'O(log n)'
    aim = 'To implement Quick Sort utilizing in-place Lomuto or Hoare partitioning.'
    sampleInput = 'Arr = [10, 80, 30, 90, 40, 50, 70]'
    expectedOutput = 'Sorted Arr = [10, 30, 40, 50, 70, 80, 90]'
    recommendations.push(
      'Implement randomized pivot selection to prevent worst-case O(n²) degradation on sorted inputs.',
      'Switch to Insertion Sort for smaller subarrays (threshold ~10) to reduce recursion overhead.',
      'Ensure recursion depth does not exceed stack size limits on large datasets.'
    )
  } else if (codeLower.includes('merge') && (codeLower.includes('mid') || codeLower.includes('left') || codeLower.includes('right'))) {
    title = 'Merge Sort Algorithm'
    topic = 'Divide and Conquer'
    timeComplexity = 'O(n log n)'
    spaceComplexity = 'O(n)'
    aim = 'To implement Merge Sort by recursively halving the list and merging sorted halves.'
    sampleInput = 'Arr = [38, 27, 43, 3, 9, 82, 10]'
    expectedOutput = 'Sorted Arr = [3, 9, 10, 27, 38, 43, 82]'
    recommendations.push(
      'Pre-allocate a single auxiliary buffer to avoid repeated allocations in the merge step.',
      'Check if array[mid] <= array[mid+1] before calling merge to skip already-sorted segments.',
      'Verify memory deallocation of temporary sub-arrays.'
    )
  } else if (codeLower.includes('dijkstra') || (codeLower.includes('dist') && codeLower.includes('adj') && codeLower.includes('weight'))) {
    title = "Dijkstra's Shortest Path Algorithm"
    topic = 'Graph Theory'
    timeComplexity = 'O((V + E) log V)'
    spaceComplexity = 'O(V + E)'
    aim = "To find the shortest paths from a single source node using Dijkstra's algorithm."
    sampleInput = 'Graph: 5 Vertices, Source = 0, Weighted Adjacency List'
    expectedOutput = 'Shortest distances from source node 0 to all vertices'
    recommendations.push(
      'Use a Min-Heap (priority_queue) rather than linear scanning to optimize time to O((V+E) log V).',
      'Verify that all edge weights are non-negative, as Dijkstra does not handle negative cycles.',
      'Store predecessor parents array to enable path reconstruction.'
    )
  } else if (codeLower.includes('bfs') || codeLower.includes('breadth')) {
    title = 'Breadth First Search (BFS) Traversal'
    topic = 'Graph Algorithms'
    timeComplexity = 'O(V + E)'
    spaceComplexity = 'O(V)'
    aim = 'To traverse graph or tree levels systematically using a FIFO Queue.'
    sampleInput = 'Adjacency list with 6 nodes, Start Vertex = 1'
    expectedOutput = 'Level-order traversal sequence: 1 -> 2 -> 3 -> 4 -> 5 -> 6'
    recommendations.push(
      'Ensure the visited set or boolean array is marked immediately upon queue insertion to prevent duplicate cycles.',
      'Account for disconnected graph components by executing BFS across all unvisited vertices.',
      'Track depth level for minimum step distance calculation.'
    )
  } else if (codeLower.includes('dfs') || codeLower.includes('depth first')) {
    title = 'Depth First Search (DFS) Traversal'
    topic = 'Graph Algorithms'
    timeComplexity = 'O(V + E)'
    spaceComplexity = 'O(V)'
    aim = 'To traverse all nodes in a graph using recursive backtracking or an explicit stack.'
    sampleInput = 'Adjacency list with 5 nodes, Start Vertex = 0'
    expectedOutput = 'DFS Traversal order starting from vertex 0'
    recommendations.push(
      'Guard against recursion stack overflow by converting to an iterative stack for dense graphs.',
      'Store discovery and finishing timestamps to facilitate topological sort or cycle detection.',
      'Check for self-loops and multi-edges in the input graph representation.'
    )
  } else if (codeLower.includes('binary') && (codeLower.includes('search') || codeLower.includes('high') || codeLower.includes('low'))) {
    title = 'Binary Search Algorithm'
    topic = 'Searching Algorithms'
    timeComplexity = 'O(log n)'
    spaceComplexity = 'O(1)'
    aim = 'To search for a target value in a sorted array with logarithmic time complexity.'
    sampleInput = 'Arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], Target = 23'
    expectedOutput = 'Target 23 found at index 5'
    recommendations.push(
      'Calculate midpoint using `low + (high - low) / 2` to prevent integer overflow on large arrays.',
      'Document boundary condition: `low <= high` vs `low < high` for exact vs lower-bound search.',
      'Add a precondition assertion verifying that the input array is strictly sorted.'
    )
  } else if (codeLower.includes('node') && (codeLower.includes('next') || codeLower.includes('head'))) {
    title = 'Linked List Operations'
    topic = 'Linear Data Structures'
    timeComplexity = 'O(n) search, O(1) insert'
    spaceComplexity = 'O(1) auxiliary'
    aim = 'To implement dynamic node allocation, insertion, traversal, and deletion in a linked list.'
    sampleInput = 'Insert: 10 -> 20 -> 30, Delete: 20'
    expectedOutput = 'Resulting list: 10 -> 30'
    recommendations.push(
      'Always validate against `nullptr` / `null` before dereferencing `head->next`.',
      'Free or deallocate deleted nodes to eliminate memory leaks.',
      'Consider using a dummy head node to simplify boundary insertions and deletions.'
    )
  } else if (codeLower.includes('stack') || codeLower.includes('push') || codeLower.includes('pop')) {
    title = 'Stack Data Structure Implementation'
    topic = 'Linear Data Structures'
    timeComplexity = 'O(1) push/pop'
    spaceComplexity = 'O(n)'
    aim = 'To implement LIFO (Last-In-First-Out) operations using an array or linked nodes.'
    sampleInput = 'Push: 5, Push: 10, Pop()'
    expectedOutput = 'Popped element: 10, Current Top: 5'
    recommendations.push(
      'Guard against Stack Overflow before push and Stack Underflow before pop.',
      'Encapsulate stack operations in a class or struct with private storage.',
      'Provide `isEmpty()` and `peek()` helper methods for clean external checks.'
    )
  } else if (codeLower.includes('knapsack') || codeLower.includes('weight') && codeLower.includes('profit')) {
    title = '0/1 Knapsack Dynamic Programming'
    topic = 'Dynamic Programming'
    timeComplexity = 'O(N × W)'
    spaceComplexity = 'O(N × W) or O(W)'
    aim = 'To maximize total value within a capacity limit using dynamic programming memoization.'
    sampleInput = 'Values = [60, 100, 120], Weights = [10, 20, 30], Capacity = 50'
    expectedOutput = 'Maximum Profit = 220'
    recommendations.push(
      'Optimize space complexity from O(N × W) to O(W) using a 1D DP array traversed in reverse.',
      'Document the DP state recurrence equation in header comments for oral examination clarity.',
      'Add backtracking logic to print which specific items were included in the optimal knapsack.'
    )
  } else {
    // Generic high-quality recommendations based on language
    const langDisplay = lang.toUpperCase()
    title = `${langDisplay} Program Implementation`
    topic = 'Computer Science Practical'
    timeComplexity = codeLower.includes('for') && codeLower.split('for').length > 2 ? 'O(n²)' : codeLower.includes('for') || codeLower.includes('while') ? 'O(n)' : 'O(1)'
    spaceComplexity = 'O(1)'
    aim = `To implement and analyze the execution of the ${langDisplay} module.`
    sampleInput = 'Standard inputs according to program specification'
    expectedOutput = 'Expected formatted output matching practical requirements'
    recommendations.push(
      'Add input validation and boundary condition assertions to ensure resilience against erroneous values.',
      'Follow standard naming conventions for identifiers and document function arguments.',
      'Measure time and space requirements to provide practical complexity analysis in your lab report.'
    )
  }

  return {
    suggested_title: title,
    aim,
    detected_language: language || (codeLower.includes('#include') ? 'cpp' : codeLower.includes('def ') ? 'python' : codeLower.includes('class') ? 'java' : 'c'),
    topic,
    time_complexity: timeComplexity,
    space_complexity: spaceComplexity,
    recommendations: recommendations.slice(0, 4),
    sample_input: sampleInput,
    expected_output: expectedOutput,
  }
}

/**
 * AI Code Recommendation Service
 */
export const getCodeRecommendations = async (params: {
  code: string
  language?: string
  experiment_id?: string
}) => {
  const code = (params.code || '').trim()

  // 1. Try backend endpoint first if available
  try {
    const res: any = await api.post('/api/ai/recommend-code', params)
    const data = res?.data || res
    if (data && data.suggested_title) {
      return data
    }
  } catch (err: any) {
    // Backend offline or 405 on static hosting - proceed to direct AI
  }

  // 2. Direct Cloud AI via REST
  if (code.length > 5) {
    try {
      const prompt = `Analyze this source code for a university engineering practical exam:
Language: ${params.language || 'auto'}
Source Code:
\`\`\`
${code}
\`\`\`

Return a pure JSON object (NO markdown fences, only raw JSON) with EXACTLY these keys:
- "suggested_title": Precise academic lab experiment title (e.g. "Dijkstra's Shortest Path Algorithm in C++")
- "aim": One sentence practical objective starting with "To implement..."
- "detected_language": programming language name
- "topic": academic topic category (e.g. "Graph Algorithms", "Linear Data Structures")
- "time_complexity": Big-O notation
- "space_complexity": Big-O notation
- "recommendations": Array of 3-4 specific engineering improvements/optimizations for this code
- "sample_input": typical test input
- "expected_output": verified expected output`

      const raw = await callDirectAi(prompt, 'You are an expert Computer Science Professor and code analysis engine. Return JSON only.')
      const parsed = parseJsonFromResponse(raw)

      if (parsed && parsed.suggested_title) {
        return {
          suggested_title: parsed.suggested_title,
          aim: parsed.aim || `Implementation and analysis of ${parsed.suggested_title}`,
          detected_language: parsed.detected_language || params.language || 'cpp',
          topic: parsed.topic || 'Algorithms',
          time_complexity: parsed.time_complexity || 'O(n)',
          space_complexity: parsed.space_complexity || 'O(1)',
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [
            'Add input boundary validations.',
            'Document algorithmic complexity.',
            'Handle null or edge cases.'
          ],
          sample_input: parsed.sample_input || 'Standard test input',
          expected_output: parsed.expected_output || 'Expected execution output',
        }
      }
    } catch (directErr) {
      console.warn('Direct AI recommendation failed, utilizing algorithmic analysis:', directErr)
    }
  }

  // 3. Resilient Local Algorithmic Analysis
  return analyzeCodeLocally(code, params.language)
}
