-- ============================================================
-- CodeVault - Seed Data
-- seed.sql
-- Demo user: 00000000-0000-0000-0000-000000000001
-- ============================================================

-- ============================================================
-- DEMO USER
-- ============================================================
-- NOTE: In production, auth.users is managed by Supabase Auth.
-- For local dev seeding, insert directly:
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at,
  aud, role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@codevault.dev',
  '$2a$10$abcdefghijklmnopqrstuvwxyz012345678901234567890', -- placeholder hash
  NOW(),
  '{"username": "demo_coder", "display_name": "Alex Demo"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, display_name, avatar_url) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo_coder',
  'Alex Demo',
  NULL
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SUBJECTS
-- ============================================================
INSERT INTO public.subjects (id, user_id, name, description, semester, color, experiment_count) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Data Structures',
  'Arrays, linked lists, stacks, queues, trees, graphs, and sorting algorithms.',
  'Semester 3',
  '#374151',
  0
),
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Operating Systems',
  'Process management, memory management, file systems, and scheduling algorithms.',
  'Semester 4',
  '#6B7280',
  0
),
(
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Python Programming',
  'Core Python concepts, file I/O, OOP, modules, and standard library usage.',
  'Semester 2',
  '#9CA3AF',
  0
);


-- ============================================================
-- EXPERIMENTS
-- ============================================================

-- Exp 1: Bubble Sort in C
INSERT INTO public.experiments (
  id, user_id, subject_id, title, experiment_number, topic, language,
  aim, theory, algorithm, source_code, sample_input, expected_output,
  actual_output, observations, personal_notes, time_complexity, space_complexity,
  is_bookmarked, is_revised, revision_count
) VALUES (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Bubble Sort Implementation',
  1,
  'Sorting Algorithms',
  'c',
  'To implement and demonstrate the Bubble Sort algorithm in C and analyze its time complexity.',
  'Bubble Sort is a simple comparison-based sorting algorithm. It repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. The algorithm gets its name because smaller elements "bubble" to the top of the list with each iteration.',
  E'1. Start\n2. Take an array of n elements\n3. For i = 0 to n-2:\n   a. For j = 0 to n-2-i:\n      - If arr[j] > arr[j+1], swap arr[j] and arr[j+1]\n4. Repeat until no swaps occur in a pass\n5. Output sorted array\n6. Stop',
  E'#include <stdio.h>\n\nvoid bubbleSort(int arr[], int n) {\n    int i, j, temp;\n    int swapped;\n\n    for (i = 0; i < n - 1; i++) {\n        swapped = 0;\n\n        for (j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                // Swap arr[j] and arr[j+1]\n                temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n                swapped = 1;\n            }\n        }\n\n        // If no two elements were swapped in the inner loop, break\n        if (swapped == 0)\n            break;\n    }\n}\n\nvoid printArray(int arr[], int n) {\n    int i;\n    for (i = 0; i < n; i++)\n        printf("%d ", arr[i]);\n    printf("\\n");\n}\n\nint main() {\n    int arr[] = {64, 34, 25, 12, 22, 11, 90};\n    int n = sizeof(arr) / sizeof(arr[0]);\n\n    printf("Unsorted array: ");\n    printArray(arr, n);\n\n    bubbleSort(arr, n);\n\n    printf("Sorted array:   ");\n    printArray(arr, n);\n\n    return 0;\n}',
  'Array: {64, 34, 25, 12, 22, 11, 90}',
  'Unsorted array: 64 34 25 12 22 11 90\nSorted array:   11 12 22 25 34 64 90',
  'Unsorted array: 64 34 25 12 22 11 90\nSorted array:   11 12 22 25 34 64 90',
  'The optimized bubble sort with the swapped flag reduces unnecessary passes. For already-sorted data, it terminates in O(n) time. The algorithm is stable — equal elements maintain their relative order.',
  'Remember: worst case is when array is reverse-sorted. Best case O(n) with the swapped optimization. NOT good for large datasets — use quicksort or mergesort instead.',
  'O(n²) worst/average, O(n) best',
  'O(1) auxiliary',
  TRUE,
  TRUE,
  2
),

-- Exp 2: Singly Linked List in C
(
  '20000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Singly Linked List Operations',
  2,
  'Linked Lists',
  'c',
  'To implement a singly linked list with insertion, deletion, and traversal operations in C.',
  'A Singly Linked List is a linear data structure where each element (node) contains a data field and a pointer to the next node. Unlike arrays, linked lists do not require contiguous memory. Nodes can be inserted or deleted in O(1) time if the position is known. Traversal is O(n).',
  E'Insertion at Head:\n1. Create new node\n2. Set new_node->next = head\n3. Set head = new_node\n\nDeletion by value:\n1. If head->data == value, head = head->next\n2. Else traverse until node->next->data == value\n3. Set node->next = node->next->next\n4. Free deleted node',
  E'#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node* next;\n};\n\nstruct Node* head = NULL;\n\nvoid insertAtHead(int data) {\n    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));\n    newNode->data = data;\n    newNode->next = head;\n    head = newNode;\n}\n\nvoid insertAtTail(int data) {\n    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));\n    newNode->data = data;\n    newNode->next = NULL;\n\n    if (head == NULL) {\n        head = newNode;\n        return;\n    }\n\n    struct Node* temp = head;\n    while (temp->next != NULL)\n        temp = temp->next;\n    temp->next = newNode;\n}\n\nvoid deleteNode(int key) {\n    struct Node* temp = head;\n    struct Node* prev = NULL;\n\n    if (temp != NULL && temp->data == key) {\n        head = temp->next;\n        free(temp);\n        return;\n    }\n\n    while (temp != NULL && temp->data != key) {\n        prev = temp;\n        temp = temp->next;\n    }\n\n    if (temp == NULL) {\n        printf("Key %d not found\\n", key);\n        return;\n    }\n\n    prev->next = temp->next;\n    free(temp);\n}\n\nvoid printList() {\n    struct Node* temp = head;\n    while (temp != NULL) {\n        printf("%d -> ", temp->data);\n        temp = temp->next;\n    }\n    printf("NULL\\n");\n}\n\nint main() {\n    insertAtTail(10);\n    insertAtTail(20);\n    insertAtTail(30);\n    insertAtHead(5);\n\n    printf("List: ");\n    printList();\n\n    deleteNode(20);\n    printf("After deleting 20: ");\n    printList();\n\n    return 0;\n}',
  'Insert 10, 20, 30 at tail, then 5 at head. Delete 20.',
  'List: 5 -> 10 -> 20 -> 30 -> NULL\nAfter deleting 20: 5 -> 10 -> 30 -> NULL',
  'List: 5 -> 10 -> 20 -> 30 -> NULL\nAfter deleting 20: 5 -> 10 -> 30 -> NULL',
  'Memory must be manually freed in C. Linked lists have O(n) search but O(1) insert/delete at known positions. No random access like arrays.',
  'Always check for NULL before dereferencing. Remember to free() deleted nodes to avoid memory leaks. Use valgrind to check.',
  'Insert O(1) head, O(n) tail; Delete O(n); Search O(n)',
  'O(n) for n nodes',
  FALSE,
  FALSE,
  0
),

-- Exp 3: Python File I/O
(
  '20000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  'File Handling in Python',
  1,
  'File I/O Operations',
  'python',
  'To study and implement file handling operations in Python including read, write, and append modes.',
  'Python provides built-in functions for file handling. The open() function is used to open a file and returns a file object. Python supports text and binary modes. The with statement ensures the file is properly closed after use, even if an exception occurs.',
  E'1. Open file using open(filename, mode)\n2. Modes: r (read), w (write), a (append), r+ (read+write)\n3. Use read(), readline(), or readlines() for reading\n4. Use write() or writelines() for writing\n5. Close file using close() or use with statement\n6. Handle FileNotFoundError for missing files',
  E'import os\n\ndef write_to_file(filename, content):\n    """Write content to a file (overwrites existing)."""\n    with open(filename, ''w'') as f:\n        f.write(content)\n    print(f"Written to {filename}")\n\ndef append_to_file(filename, content):\n    """Append content to an existing file."""\n    with open(filename, ''a'') as f:\n        f.write(content)\n    print(f"Appended to {filename}")\n\ndef read_file(filename):\n    """Read entire file content."""\n    try:\n        with open(filename, ''r'') as f:\n            content = f.read()\n        return content\n    except FileNotFoundError:\n        return f"Error: {filename} not found"\n\ndef read_lines(filename):\n    """Read file line by line."""\n    try:\n        with open(filename, ''r'') as f:\n            lines = f.readlines()\n        return lines\n    except FileNotFoundError:\n        return []\n\ndef count_words(filename):\n    """Count words in a file."""\n    content = read_file(filename)\n    if content.startswith("Error"):\n        return 0\n    return len(content.split())\n\nif __name__ == "__main__":\n    fname = "sample.txt"\n\n    # Write\n    write_to_file(fname, "Hello, CodeVault!\\nLearning Python file I/O.\\n")\n\n    # Append\n    append_to_file(fname, "Third line added.\\n")\n\n    # Read all\n    print("\\nFile contents:")\n    print(read_file(fname))\n\n    # Read lines\n    print(f"Number of lines: {len(read_lines(fname))}")\n    print(f"Number of words: {count_words(fname)}")\n\n    # Cleanup\n    os.remove(fname)\n    print("\\nFile deleted.")',
  'No input; creates and manages sample.txt',
  E'Written to sample.txt\nAppended to sample.txt\n\nFile contents:\nHello, CodeVault!\nLearning Python file I/O.\nThird line added.\n\nNumber of lines: 3\nNumber of words: 10\n\nFile deleted.',
  E'Written to sample.txt\nAppended to sample.txt\n\nFile contents:\nHello, CodeVault!\nLearning Python file I/O.\nThird line added.\n\nNumber of lines: 3\nNumber of words: 10\n\nFile deleted.',
  'The with statement (context manager) is the preferred way to handle files. It automatically closes the file. Always handle FileNotFoundError for read operations.',
  'Use pathlib.Path instead of os.path for modern Python. with open() is always preferred over manual f.close().',
  'O(n) for read/write where n = file size',
  'O(n) buffer',
  FALSE,
  TRUE,
  1
),

-- Exp 4: CPU Scheduling - FCFS in C
(
  '20000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  'FCFS CPU Scheduling Algorithm',
  1,
  'CPU Scheduling',
  'c',
  'To implement the First Come First Serve (FCFS) CPU scheduling algorithm and compute average waiting time and turnaround time.',
  'FCFS is the simplest CPU scheduling algorithm. Processes are executed in the order they arrive. It is non-preemptive — once a process starts, it runs to completion. Waiting time = start time - arrival time. Turnaround time = completion time - arrival time.',
  E'1. Accept n processes with arrival time and burst time\n2. Sort processes by arrival time\n3. For each process in order:\n   a. Start time = max(current_time, arrival_time)\n   b. Completion time = start_time + burst_time\n   c. Waiting time = start_time - arrival_time\n   d. Turnaround time = completion_time - arrival_time\n4. Compute averages\n5. Display Gantt chart and results',
  E'#include <stdio.h>\n\nstruct Process {\n    int pid;\n    int arrival;\n    int burst;\n    int start;\n    int completion;\n    int waiting;\n    int turnaround;\n};\n\nvoid fcfs(struct Process p[], int n) {\n    int current_time = 0;\n\n    for (int i = 0; i < n; i++) {\n        if (current_time < p[i].arrival)\n            current_time = p[i].arrival;\n\n        p[i].start      = current_time;\n        p[i].completion = current_time + p[i].burst;\n        p[i].waiting    = p[i].start - p[i].arrival;\n        p[i].turnaround = p[i].completion - p[i].arrival;\n        current_time    = p[i].completion;\n    }\n}\n\nint main() {\n    int n = 4;\n    struct Process p[] = {\n        {1, 0, 5},\n        {2, 1, 3},\n        {3, 2, 8},\n        {4, 3, 6}\n    };\n\n    fcfs(p, n);\n\n    printf("PID  Arrival  Burst  Start  Completion  Waiting  Turnaround\\n");\n    printf("---  -------  -----  -----  ----------  -------  ----------\\n");\n\n    float total_wt = 0, total_tat = 0;\n    for (int i = 0; i < n; i++) {\n        printf("%-4d %-8d %-6d %-6d %-11d %-8d %d\\n",\n            p[i].pid, p[i].arrival, p[i].burst,\n            p[i].start, p[i].completion,\n            p[i].waiting, p[i].turnaround);\n        total_wt  += p[i].waiting;\n        total_tat += p[i].turnaround;\n    }\n\n    printf("\\nAverage Waiting Time:    %.2f\\n", total_wt / n);\n    printf("Average Turnaround Time: %.2f\\n", total_tat / n);\n\n    return 0;\n}',
  'n=4, Processes: P1(AT=0,BT=5), P2(AT=1,BT=3), P3(AT=2,BT=8), P4(AT=3,BT=6)',
  E'PID  Arrival  Burst  Start  Completion  Waiting  Turnaround\n---  -------  -----  -----  ----------  -------  ----------\n1    0        5      0      5           0        5\n2    1        3      5      8           4        7\n3    2        8      8      16          6        14\n4    3        6      16     22          13       19\n\nAverage Waiting Time:    5.75\nAverage Turnaround Time: 11.25',
  E'PID  Arrival  Burst  Start  Completion  Waiting  Turnaround\n---  -------  -----  -----  ----------  -------  ----------\n1    0        5      0      5           0        5\n2    1        3      5      8           4        7\n3    2        8      8      16          6        14\n4    3        6      16     22          13       19\n\nAverage Waiting Time:    5.75\nAverage Turnaround Time: 11.25',
  'FCFS suffers from the convoy effect — short processes stuck behind long ones. Not suitable for interactive systems. SJF gives better average waiting time.',
  'Exam tip: Always sort by arrival time first! Draw Gantt chart for viva.',
  'O(n log n) with sorting, O(n) execution',
  'O(n)',
  TRUE,
  TRUE,
  3
),

-- Exp 5: Stack using Array in C
(
  '20000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Stack Implementation Using Array',
  3,
  'Stacks',
  'c',
  'To implement a stack data structure using an array with push, pop, peek, and isEmpty operations.',
  'A Stack is a linear data structure that follows the LIFO (Last In, First Out) principle. The element inserted last is the first to be removed. Main operations: push (insert), pop (remove), peek (view top), isEmpty (check if empty). Applications: expression evaluation, backtracking, function call management.',
  E'Push:\n1. Check if stack is full (top == MAX-1)\n2. Increment top\n3. stack[top] = element\n\nPop:\n1. Check if stack is empty (top == -1)\n2. Return stack[top]\n3. Decrement top',
  E'#include <stdio.h>\n#define MAX 100\n\nint stack[MAX];\nint top = -1;\n\nint isEmpty() { return top == -1; }\nint isFull()  { return top == MAX - 1; }\n\nvoid push(int val) {\n    if (isFull()) {\n        printf("Stack Overflow!\\n");\n        return;\n    }\n    stack[++top] = val;\n    printf("Pushed: %d\\n", val);\n}\n\nint pop() {\n    if (isEmpty()) {\n        printf("Stack Underflow!\\n");\n        return -1;\n    }\n    return stack[top--];\n}\n\nint peek() {\n    if (isEmpty()) {\n        printf("Stack is empty\\n");\n        return -1;\n    }\n    return stack[top];\n}\n\nvoid display() {\n    if (isEmpty()) {\n        printf("Stack is empty\\n");\n        return;\n    }\n    printf("Stack (top to bottom): ");\n    for (int i = top; i >= 0; i--)\n        printf("%d ", stack[i]);\n    printf("\\n");\n}\n\nint main() {\n    push(10);\n    push(20);\n    push(30);\n    display();\n    printf("Top element: %d\\n", peek());\n    printf("Popped: %d\\n", pop());\n    display();\n    return 0;\n}',
  'Push 10, 20, 30; then pop once.',
  E'Pushed: 10\nPushed: 20\nPushed: 30\nStack (top to bottom): 30 20 10\nTop element: 30\nPopped: 30\nStack (top to bottom): 20 10',
  E'Pushed: 10\nPushed: 20\nPushed: 30\nStack (top to bottom): 30 20 10\nTop element: 30\nPopped: 30\nStack (top to bottom): 20 10',
  'Fixed-size array-based stack has O(1) operations but wastes memory if MAX is large. Dynamic stack using linked list avoids this. Overflow and underflow checks are critical.',
  'Arrays give cache-friendly access. For dynamic size, use linked list-based stack.',
  'O(1) for all operations',
  'O(n) for n elements',
  FALSE,
  FALSE,
  0
),

-- Exp 6: Python OOP
(
  '20000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  'Object-Oriented Programming in Python',
  2,
  'OOP Concepts',
  'python',
  'To implement Object-Oriented Programming concepts (classes, inheritance, encapsulation, polymorphism) in Python.',
  'OOP organizes code into objects that combine data (attributes) and behavior (methods). Key concepts: Class (blueprint), Object (instance), Inheritance (child extends parent), Encapsulation (data hiding with _ or __), Polymorphism (same interface, different behavior).',
  E'1. Define base class with __init__, instance methods\n2. Use _attr for protected, __attr for private\n3. Derive child class using class Child(Parent)\n4. Override methods for polymorphism\n5. Use super() to call parent methods',
  E'class Animal:\n    def __init__(self, name, species):\n        self.name    = name      # public\n        self._species = species  # protected\n        self.__id    = id(self)  # private\n\n    def speak(self):\n        return f"{self.name} makes a sound"\n\n    def info(self):\n        return f"{self.name} ({self._species})"\n\n    def get_id(self):\n        return self.__id\n\n\nclass Dog(Animal):\n    def __init__(self, name, breed):\n        super().__init__(name, "Canis lupus familiaris")\n        self.breed = breed\n\n    def speak(self):  # polymorphism — override\n        return f"{self.name} says: Woof!"\n\n    def fetch(self, item):\n        return f"{self.name} fetches the {item}!"\n\n\nclass Cat(Animal):\n    def __init__(self, name, indoor=True):\n        super().__init__(name, "Felis catus")\n        self.indoor = indoor\n\n    def speak(self):  # polymorphism\n        return f"{self.name} says: Meow!"\n\n\ndef animal_chorus(animals):\n    """Demonstrate polymorphism."""\n    for animal in animals:\n        print(animal.speak())\n\n\nif __name__ == "__main__":\n    dog = Dog("Rex", "German Shepherd")\n    cat = Cat("Whiskers")\n    generic = Animal("Parrot", "Psittacine")\n\n    print("=== Animal Info ===")\n    for a in [dog, cat, generic]:\n        print(a.info())\n\n    print("\\n=== Animal Chorus (Polymorphism) ===")\n    animal_chorus([dog, cat, generic])\n\n    print("\\n=== Dog Special Methods ===")\n    print(dog.fetch("ball"))\n    print(f"Dog ID: {dog.get_id()}")',
  'No input; uses hardcoded objects.',
  E'=== Animal Info ===\nRex (Canis lupus familiaris)\nWhiskers (Felis catus)\nParrot (Psittacine)\n\n=== Animal Chorus (Polymorphism) ===\nRex says: Woof!\nWhiskers says: Meow!\nParrot makes a sound\n\n=== Dog Special Methods ===\nRex fetches the ball!\nDog ID: <some integer>',
  E'=== Animal Info ===\nRex (Canis lupus familiaris)\nWhiskers (Felis catus)\nParrot (Psittacine)\n\n=== Animal Chorus (Polymorphism) ===\nRex says: Woof!\nWhiskers says: Meow!\nParrot makes a sound\n\n=== Dog Special Methods ===\nRex fetches the ball!\nDog ID: 140234567891234',
  'Python uses duck typing — if an object has the required method, it works. __dunder__ methods allow operator overloading. super() is crucial for cooperative inheritance.',
  '__init__ is not a constructor in the C++ sense — __new__ is. self is explicit in Python unlike implicit this. Memorize the 4 pillars: Encapsulation, Abstraction, Inheritance, Polymorphism.',
  'O(1) for method dispatch',
  'O(n) for n objects',
  FALSE,
  TRUE,
  1
);


-- ============================================================
-- AI EXPLANATIONS (for Exp 1 and Exp 4)
-- ============================================================
INSERT INTO public.ai_explanations (
  id, experiment_id, user_id, mode,
  program_overview, simple_explanation, line_by_line,
  logic_breakdown, execution_flow, variables_and_functions,
  algorithm_explanation, io_explanation,
  time_complexity, space_complexity, common_mistakes, exam_points
) VALUES
(
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'exam',
  'Bubble Sort sorts an array by repeatedly comparing and swapping adjacent elements until sorted.',
  'Imagine you have a line of people sorted by height. You walk through the line, and whenever two neighbors are in the wrong order, you swap them. After one full walk, the tallest person is at the end. Repeat for the rest.',
  E'Lines 1-3: Function signature — takes array pointer and size.\nLines 4-5: Declare temp for swap, swapped flag for optimization.\nLines 7-20: Outer loop runs n-1 passes.\nLines 9-16: Inner loop compares adjacent pairs, swaps if needed.\nLines 18-20: If no swap occurred in a full pass, array is sorted — exit early.',
  'Two nested loops: outer controls passes, inner does comparisons. The swapped flag is the key optimization — without it, worst and best case are both O(n²).',
  E'Pass 1: [64,34,25,12,22,11,90] → [34,25,12,22,11,64,90]\nPass 2: [34,25,12,22,11,64,90] → [25,12,22,11,34,64,90]\n...\nFinal:  [11,12,22,25,34,64,90]',
  'bubbleSort(arr, n): main sorting function. printArray(arr, n): utility to print. temp: swap variable. swapped: optimization flag. i: outer pass counter. j: inner comparison index.',
  'Compare-and-swap on adjacent pairs. Each pass guarantees the i-th largest element reaches its correct position at index n-1-i.',
  'Input: hardcoded array {64,34,25,12,22,11,90}. Output: sorted array printed to stdout.',
  'Worst: O(n²) — reverse sorted. Best: O(n) — already sorted (with swapped flag). Average: O(n²).',
  'O(1) — sorts in-place using only temp variable.',
  E'1. Forgetting the -i in inner loop bound (causes redundant comparisons).\n2. Not initializing swapped = 0 inside outer loop (flag persists wrongly).\n3. Using > instead of >= breaks stability.',
  E'1. Stable sorting algorithm.\n2. Adaptive with swapped flag.\n3. In-place — O(1) space.\n4. Not suitable for large n.\n5. Best case O(n) is a common exam question.'
),
(
  '30000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'detailed',
  'FCFS schedules CPU processes in arrival order. Each process runs to completion before the next starts.',
  'Like a queue at a ticket counter — whoever arrives first gets served first. No one can cut in line.',
  E'struct Process fields: pid (ID), arrival, burst, start, completion, waiting, turnaround.\nfcfs() function: iterates processes in order, computing times.\ncurrent_time tracks CPU clock.\nIf CPU is idle (current_time < arrival), it skips ahead to arrival time.',
  'FCFS is non-preemptive. Waiting time = start - arrival. Turnaround = completion - arrival. Completion = start + burst. Current time advances by burst each step.',
  E'Time 0: P1 arrives and starts. Runs 0-5.\nTime 5: P2 (arrived at 1) starts. Runs 5-8.\nTime 8: P3 (arrived at 2) starts. Runs 8-16.\nTime 16: P4 (arrived at 3) starts. Runs 16-22.',
  'current_time: CPU clock. p[i].start: when process begins. p[i].completion: when it ends. p[i].waiting: time spent in ready queue. p[i].turnaround: total time from arrival to completion.',
  'Sort by arrival. Execute sequentially. No interruptions. The convoy effect occurs when long processes block shorter ones.',
  'Input: process list with arrival and burst times. Output: table with all computed times and averages.',
  'O(n log n) for sorting, O(n) for computation. Overall O(n log n).',
  'O(n) for process array.',
  E'1. Forgetting to advance current_time to arrival if CPU is idle (causes negative waiting times).\n2. Not sorting by arrival time.\n3. Confusing waiting time with response time.',
  E'1. Non-preemptive scheduling.\n2. Suffers convoy effect.\n3. Fairness: arrives first, served first.\n4. No starvation.\n5. Poor for interactive systems.\n6. Formulas: WT = ST - AT, TAT = CT - AT, CT = ST + BT.'
);


-- ============================================================
-- FLASHCARDS (for Exp 1: Bubble Sort)
-- ============================================================
INSERT INTO public.flashcards (
  id, experiment_id, user_id, question, answer, difficulty, times_shown, times_correct
) VALUES
(
  '40000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'What is the best case time complexity of Bubble Sort with the swapped flag optimization?',
  'O(n) — when the array is already sorted, the first pass detects no swaps and exits immediately.',
  'easy',
  5, 4
),
(
  '40000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Is Bubble Sort a stable sorting algorithm?',
  'Yes — Bubble Sort is stable. Equal elements maintain their relative order because we only swap when arr[j] > arr[j+1] (strictly greater, not >=).',
  'medium',
  3, 2
),
(
  '40000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'What is the purpose of the "swapped" flag in the optimized Bubble Sort?',
  'It detects when no swaps occurred in a full inner pass, meaning the array is already sorted. The algorithm exits early, giving O(n) best case instead of O(n²).',
  'medium',
  4, 3
),
(
  '40000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'What is the space complexity of Bubble Sort and why?',
  'O(1) auxiliary space — Bubble Sort sorts in-place using only a single temp variable for swaps. No additional arrays are needed.',
  'easy',
  6, 6
),
(
  '40000000-0000-0000-0000-000000000005',
  '20000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'What is the convoy effect in FCFS scheduling?',
  'When a long CPU-bound process holds the CPU, shorter processes wait behind it. This increases average waiting time significantly. Like a slow truck blocking all cars on a single-lane road.',
  'hard',
  4, 2
),
(
  '40000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'Give the formulas for Waiting Time and Turnaround Time in CPU scheduling.',
  'Waiting Time (WT) = Start Time (ST) - Arrival Time (AT)\nTurnaround Time (TAT) = Completion Time (CT) - Arrival Time (AT)\nAlso: TAT = WT + Burst Time (BT)',
  'medium',
  7, 6
);


-- ============================================================
-- QUIZZES & QUESTIONS (Bubble Sort MCQ Quiz)
-- ============================================================
INSERT INTO public.quizzes (
  id, experiment_id, subject_id, user_id, quiz_type, title
) VALUES (
  '50000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'mcq',
  'Bubble Sort - MCQ Quiz'
);

INSERT INTO public.quiz_questions (
  id, quiz_id, question_text, option_a, option_b, option_c, option_d,
  correct_option, explanation, code_snippet, order_index
) VALUES
(
  '51000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  'What is the worst case time complexity of Bubble Sort?',
  'O(n)', 'O(n log n)', 'O(n²)', 'O(log n)',
  'C',
  'In the worst case (reverse-sorted array), Bubble Sort performs n(n-1)/2 comparisons, giving O(n²).',
  NULL, 1
),
(
  '51000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000001',
  'After how many passes is the largest element guaranteed to be at its correct position?',
  '0 passes', '1 pass', 'n/2 passes', 'n-1 passes',
  'B',
  'After 1 pass, the largest element bubbles to the last position (index n-1).',
  NULL, 2
),
(
  '51000000-0000-0000-0000-000000000003',
  '50000000-0000-0000-0000-000000000001',
  'What does the following code snippet output?',
  '[1, 2, 3, 4]', '[4, 3, 2, 1]', '[1, 3, 2, 4]', '[2, 1, 3, 4]',
  'A',
  'Bubble Sort correctly sorts the array in ascending order.',
  E'int arr[] = {4, 2, 1, 3};\nbubbleSort(arr, 4);\nprintArray(arr, 4);',
  3
),
(
  '51000000-0000-0000-0000-000000000004',
  '50000000-0000-0000-0000-000000000001',
  'Which property of Bubble Sort makes it suitable for nearly-sorted arrays?',
  'It is unstable', 'The swapped flag gives O(n) best case', 'It uses O(n) space', 'It is non-adaptive',
  'B',
  'The swapped optimization makes Bubble Sort adaptive — it exits early when no swaps occur, achieving O(n) on nearly-sorted data.',
  NULL, 4
);


-- ============================================================
-- QUIZ ATTEMPTS
-- ============================================================
INSERT INTO public.quiz_attempts (
  id, quiz_id, user_id, score, total_questions, time_taken_seconds, answers, completed_at
) VALUES
(
  '52000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  75.00, 4, 142,
  '{"51000000-0000-0000-0000-000000000001": "C", "51000000-0000-0000-0000-000000000002": "B", "51000000-0000-0000-0000-000000000003": "A", "51000000-0000-0000-0000-000000000004": "A"}'::jsonb,
  NOW() - INTERVAL '3 days'
),
(
  '52000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  100.00, 4, 98,
  '{"51000000-0000-0000-0000-000000000001": "C", "51000000-0000-0000-0000-000000000002": "B", "51000000-0000-0000-0000-000000000003": "A", "51000000-0000-0000-0000-000000000004": "B"}'::jsonb,
  NOW() - INTERVAL '1 day'
);


-- ============================================================
-- REVISION SESSIONS
-- ============================================================
INSERT INTO public.revision_sessions (
  id, user_id, experiment_id, scheduled_date, completed_at, session_type, notes
) VALUES
(
  '60000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  CURRENT_DATE - INTERVAL '7 days',
  NOW() - INTERVAL '7 days' + INTERVAL '25 minutes',
  'flashcard',
  'Reviewed all bubble sort flashcards. Struggled with the stability question initially.'
),
(
  '60000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  CURRENT_DATE - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '15 minutes',
  'mcq',
  'Scored 3/4 on MCQ quiz. Need to review adaptive vs. non-adaptive sorting.'
),
(
  '60000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000004',
  CURRENT_DATE - INTERVAL '5 days',
  NOW() - INTERVAL '5 days' + INTERVAL '30 minutes',
  'viva',
  'Practiced FCFS Gantt chart drawing. Explained convoy effect in own words.'
),
(
  '60000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000003',
  CURRENT_DATE - INTERVAL '2 days',
  NOW() - INTERVAL '2 days' + INTERVAL '20 minutes',
  'quick',
  'Quick read-through of Python file I/O. Context manager is important.'
),
(
  '60000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000006',
  CURRENT_DATE + INTERVAL '2 days',
  NULL,  -- not yet completed
  'flashcard',
  NULL
),
(
  '60000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  CURRENT_DATE + INTERVAL '4 days',
  NULL,
  'quick',
  NULL
);


-- ============================================================
-- BOOKMARKS
-- ============================================================
INSERT INTO public.bookmarks (id, user_id, experiment_id) VALUES
(
  '70000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001'
),
(
  '70000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000004'
);


-- ============================================================
-- CONVERSATIONS & MESSAGES (sample AI chat session)
-- ============================================================
INSERT INTO public.conversations (id, user_id, experiment_id, title) VALUES
(
  '80000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Understanding Bubble Sort Complexity'
),
(
  '80000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'General Python Questions'
);

INSERT INTO public.messages (id, conversation_id, role, content, metadata) VALUES
(
  '81000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000001',
  'user',
  'Why is Bubble Sort O(n²) in the worst case? Can you walk me through the math?',
  '{"tokens": 18}'::jsonb
),
(
  '81000000-0000-0000-0000-000000000002',
  '80000000-0000-0000-0000-000000000001',
  'assistant',
  E'Great question! Let''s count the comparisons.\n\nIn Bubble Sort, the outer loop runs **n-1** times. In each pass i, the inner loop runs **n-1-i** times.\n\nTotal comparisons = (n-1) + (n-2) + ... + 1 = **n(n-1)/2**\n\nThis simplifies to **O(n²)**.\n\n**Example with n=4:**\n- Pass 1: 3 comparisons\n- Pass 2: 2 comparisons  \n- Pass 3: 1 comparison\n- **Total: 6 = 4×3/2**\n\nThe worst case occurs when the array is sorted in **reverse order** — every comparison results in a swap.',
  '{"tokens": 142, "model": "gemini-pro"}'::jsonb
),
(
  '81000000-0000-0000-0000-000000000003',
  '80000000-0000-0000-0000-000000000001',
  'user',
  'What about when the array is already sorted?',
  '{"tokens": 12}'::jsonb
),
(
  '81000000-0000-0000-0000-000000000004',
  '80000000-0000-0000-0000-000000000001',
  'assistant',
  E'With the **swapped flag optimization**, an already-sorted array gives **O(n)** time!\n\nHere''s why:\n- Pass 1: We compare all n-1 adjacent pairs, find **zero swaps**, set `swapped = 0`\n- The outer loop checks `if (swapped == 0) break;` and **exits immediately**\n- Total: only **n-1** comparisons → **O(n)**\n\n**Without** the swapped flag, it would still run all n-1 passes = O(n²) even for sorted input. The flag is what makes Bubble Sort **adaptive**.',
  '{"tokens": 128, "model": "gemini-pro"}'::jsonb
),
(
  '81000000-0000-0000-0000-000000000005',
  '80000000-0000-0000-0000-000000000002',
  'user',
  'What is the difference between a list and a tuple in Python?',
  '{"tokens": 16}'::jsonb
),
(
  '81000000-0000-0000-0000-000000000006',
  '80000000-0000-0000-0000-000000000002',
  'assistant',
  E'**List vs Tuple in Python:**\n\n| Feature | List | Tuple |\n|---------|------|-------|\n| Syntax | `[1, 2, 3]` | `(1, 2, 3)` |\n| Mutability | Mutable ✅ | Immutable ❌ |\n| Performance | Slightly slower | Slightly faster |\n| Use case | Dynamic data | Fixed data |\n| Hashable | No | Yes (if elements hashable) |\n\n**Key rule:** Use tuples when data shouldn''t change (coordinates, RGB colors, DB records). Use lists when you need to add/remove items.',
  '{"tokens": 156, "model": "gemini-pro"}'::jsonb
);


-- ============================================================
-- EXAM SCHEDULES
-- ============================================================
INSERT INTO public.exam_schedules (
  id, user_id, subject_id, exam_name, exam_date,
  experiment_ids, reminder_days, is_completed
) VALUES
(
  '90000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Data Structures Lab Exam',
  CURRENT_DATE + INTERVAL '14 days',
  ARRAY[
    '20000000-0000-0000-0000-000000000001'::uuid,
    '20000000-0000-0000-0000-000000000002'::uuid,
    '20000000-0000-0000-0000-000000000005'::uuid
  ],
  3,
  FALSE
),
(
  '90000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  'OS Theory Exam',
  CURRENT_DATE + INTERVAL '21 days',
  ARRAY[
    '20000000-0000-0000-0000-000000000004'::uuid
  ],
  5,
  FALSE
);
