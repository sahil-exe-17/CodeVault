"""
SQLite Database service for CodeVault.
Fully replaces Supabase with local, persistent, zero-configuration relational storage.
"""
import os
import sqlite3
import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

DB_FILE = os.getenv("DATABASE_PATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "codevault.db"))


def get_connection() -> sqlite3.Connection:
    """Return a connection with Row factory enabled."""
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    """Create all tables and seed initial data if database is new."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT,
        display_name TEXT,
        avatar_url TEXT,
        college TEXT,
        department TEXT,
        semester TEXT,
        roll_number TEXT,
        coding_goals TEXT,
        is_profile_completed INTEGER DEFAULT 0,
        password_hash TEXT,
        auth_provider TEXT DEFAULT 'email',
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        semester TEXT,
        color TEXT DEFAULT '#ffffff',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS experiments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject_id TEXT,
        title TEXT NOT NULL,
        experiment_number TEXT,
        topic TEXT,
        language TEXT DEFAULT 'c',
        aim TEXT,
        theory TEXT,
        algorithm TEXT,
        source_code TEXT,
        code_files TEXT,
        sample_input TEXT,
        expected_output TEXT,
        actual_output TEXT,
        observations TEXT,
        personal_notes TEXT,
        time_complexity TEXT DEFAULT 'O(n)',
        space_complexity TEXT DEFAULT 'O(1)',
        notebook_pdf_url TEXT,
        notebook_pdf_name TEXT,
        notebook_pdf_size INTEGER,
        notebook_uploaded_at TEXT,
        is_bookmarked INTEGER DEFAULT 0,
        is_revised INTEGER DEFAULT 0,
        revision_count INTEGER DEFAULT 0,
        last_opened_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS ai_explanations (
        id TEXT PRIMARY KEY,
        experiment_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        mode TEXT DEFAULT 'exam',
        program_overview TEXT,
        simple_explanation TEXT,
        line_by_line TEXT,
        logic_breakdown TEXT,
        execution_flow TEXT,
        variables_and_functions TEXT,
        algorithm_explanation TEXT,
        io_explanation TEXT,
        time_complexity TEXT,
        space_complexity TEXT,
        common_mistakes TEXT,
        exam_points TEXT,
        raw_response TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        experiment_id TEXT,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS flashcards (
        id TEXT PRIMARY KEY,
        experiment_id TEXT,
        user_id TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        difficulty TEXT DEFAULT 'medium',
        times_shown INTEGER DEFAULT 0,
        times_correct INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        experiment_id TEXT,
        subject_id TEXT,
        user_id TEXT NOT NULL,
        quiz_type TEXT DEFAULT 'mcq',
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        question_text TEXT NOT NULL,
        option_a TEXT,
        option_b TEXT,
        option_c TEXT,
        option_d TEXT,
        correct_option TEXT,
        explanation TEXT,
        code_snippet TEXT,
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        score REAL NOT NULL,
        total_questions INTEGER NOT NULL,
        time_taken_seconds INTEGER DEFAULT 0,
        answers TEXT,
        completed_at TEXT NOT NULL,
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS revision_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        experiment_id TEXT NOT NULL,
        scheduled_date TEXT NOT NULL,
        completed_at TEXT,
        session_type TEXT DEFAULT 'flashcard',
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exam_schedules (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject_id TEXT,
        exam_name TEXT NOT NULL,
        exam_date TEXT NOT NULL,
        experiment_ids TEXT,
        is_completed INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        experiment_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, experiment_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE
    );
    """)

    conn.commit()

    # Migration: ensure notebook PDF and multi-code columns exist in experiments
    cursor.execute("PRAGMA table_info(experiments);")
    exp_cols = [row["name"] for row in cursor.fetchall()]
    if "notebook_pdf_url" not in exp_cols:
        cursor.execute("ALTER TABLE experiments ADD COLUMN notebook_pdf_url TEXT;")
    if "notebook_pdf_name" not in exp_cols:
        cursor.execute("ALTER TABLE experiments ADD COLUMN notebook_pdf_name TEXT;")
    if "notebook_pdf_size" not in exp_cols:
        cursor.execute("ALTER TABLE experiments ADD COLUMN notebook_pdf_size INTEGER;")
    if "notebook_uploaded_at" not in exp_cols:
        cursor.execute("ALTER TABLE experiments ADD COLUMN notebook_uploaded_at TEXT;")
    if "code_files" not in exp_cols:
        cursor.execute("ALTER TABLE experiments ADD COLUMN code_files TEXT;")

    # Migration: ensure onboarding profile columns exist in users
    cursor.execute("PRAGMA table_info(users);")
    user_cols = [row["name"] for row in cursor.fetchall()]
    if "college" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN college TEXT;")
    if "department" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN department TEXT;")
    if "semester" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN semester TEXT;")
    if "roll_number" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN roll_number TEXT;")
    if "coding_goals" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN coding_goals TEXT;")
    if "is_profile_completed" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN is_profile_completed INTEGER DEFAULT 0;")
    if "password_hash" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT;")
    if "auth_provider" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'email';")
    conn.commit()
    conn.close()


def _seed_initial_data(conn: sqlite3.Connection):
    """Seed comprehensive course experiments and subjects."""
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    demo_user_id = "00000000-0000-0000-0000-000000000001"

    cursor.execute("""
    INSERT INTO users (id, email, username, display_name, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (demo_user_id, "alex@codevault.dev", "alexdev", "Alex Rivera", now))

    # Subjects
    sub1_id = "sub-1"
    sub2_id = "sub-2"
    sub3_id = "sub-3"

    cursor.execute("""
    INSERT INTO subjects (id, user_id, name, description, semester, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (sub1_id, demo_user_id, "Data Structures & Algorithms", "Linear and non-linear structures, sorting, trees, graphs, and algorithmic complexity.", "Semester 3", now, now))

    cursor.execute("""
    INSERT INTO subjects (id, user_id, name, description, semester, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (sub2_id, demo_user_id, "Operating Systems", "Process scheduling, synchronization, deadlocks, virtual memory, and file systems.", "Semester 4", now, now))

    cursor.execute("""
    INSERT INTO subjects (id, user_id, name, description, semester, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (sub3_id, demo_user_id, "Python Programming", "Asynchronous paradigms, socket network programming, and algorithmic data workflows.", "Semester 3", now, now))

    # Experiments
    exp1_code = """#include <stdio.h>

// Bubble Sort with early exit flag optimization
void bubbleSort(int arr[], int n) {
    int i, j, temp, swapped;
    for (i = 0; i < n - 1; i++) {
        swapped = 0;
        for (j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = 1;
            }
        }
        // If no two elements were swapped, array is already sorted
        if (swapped == 0) break;
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr)/sizeof(arr[0]);
    bubbleSort(arr, n);
    printf("Sorted array: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}"""

    cursor.execute("""
    INSERT INTO experiments (id, user_id, subject_id, title, experiment_number, topic, language, aim, theory, algorithm, source_code, sample_input, expected_output, actual_output, time_complexity, space_complexity, is_bookmarked, is_revised, revision_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "exp-1",
        demo_user_id,
        sub1_id,
        "Bubble Sort with Early Exit Flag",
        "EXP-01",
        "Sorting & Complexity",
        "c",
        "To implement and analyze Bubble Sort in C with early termination flag optimization.",
        "Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Pass count is reduced using a boolean flag.",
        "Step 1: Start\nStep 2: Loop i from 0 to n-2\nStep 3: Set swapped = 0\nStep 4: Loop j from 0 to n-i-2\nStep 5: If arr[j] > arr[j+1], swap and set swapped = 1\nStep 6: If swapped is 0, break\nStep 7: End",
        exp1_code,
        "64 34 25 12 22 11 90",
        "11 12 22 25 34 64 90",
        "Sorted array: 11 12 22 25 34 64 90",
        "O(n²)",
        "O(1)",
        1, 1, 2, now, now
    ))

    exp2_code = """#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

void insertAtHead(struct Node** head_ref, int new_data) {
    struct Node* new_node = (struct Node*)malloc(sizeof(struct Node));
    new_node->data = new_data;
    new_node->next = (*head_ref);
    (*head_ref) = new_node;
}

void printList(struct Node* node) {
    while (node != NULL) {
        printf("%d -> ", node->data);
        node = node->next;
    }
    printf("NULL\\n");
}

int main() {
    struct Node* head = NULL;
    insertAtHead(&head, 30);
    insertAtHead(&head, 20);
    insertAtHead(&head, 10);
    printf("Created Linked List: ");
    printList(head);
    return 0;
}"""

    cursor.execute("""
    INSERT INTO experiments (id, user_id, subject_id, title, experiment_number, topic, language, aim, theory, algorithm, source_code, sample_input, expected_output, actual_output, time_complexity, space_complexity, is_bookmarked, is_revised, revision_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "exp-2",
        demo_user_id,
        sub1_id,
        "Singly Linked List Insertion & Traversal",
        "EXP-02",
        "Dynamic Memory & Pointers",
        "c",
        "To allocate dynamic heap memory using malloc and construct a singly linked list.",
        "A linked list is a linear data structure where elements are not stored at contiguous memory locations; elements are linked using pointers.",
        "Step 1: Allocate memory for new node\nStep 2: Assign data\nStep 3: Point next to current head\nStep 4: Update head",
        exp2_code,
        "10, 20, 30",
        "10 -> 20 -> 30 -> NULL",
        "Created Linked List: 10 -> 20 -> 30 -> NULL",
        "O(1) insertion, O(n) traversal",
        "O(n)",
        0, 0, 0, now, now
    ))

    exp3_code = """# Round Robin CPU Scheduling Simulator
def calculate_turnaround_waiting(processes, burst_times, quantum):
    n = len(processes)
    rem_bt = list(burst_times)
    waiting_time = [0] * n
    t = 0
    
    while True:
        done = True
        for i in range(n):
            if rem_bt[i] > 0:
                done = False
                if rem_bt[i] > quantum:
                    t += quantum
                    rem_bt[i] -= quantum
                else:
                    t += rem_bt[i]
                    waiting_time[i] = t - burst_times[i]
                    rem_bt[i] = 0
        if done:
            break
            
    print(f"Average Waiting Time: {sum(waiting_time)/n:.2f}")

processes = [1, 2, 3]
burst_times = [10, 5, 8]
quantum = 2
calculate_turnaround_waiting(processes, burst_times, quantum)
"""

    cursor.execute("""
    INSERT INTO experiments (id, user_id, subject_id, title, experiment_number, topic, language, aim, theory, algorithm, source_code, sample_input, expected_output, actual_output, time_complexity, space_complexity, is_bookmarked, is_revised, revision_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "exp-3",
        demo_user_id,
        sub2_id,
        "Round Robin CPU Scheduling Simulator",
        "EXP-03",
        "Process Scheduling",
        "python",
        "Simulate preemptive Round Robin scheduling with a fixed time quantum.",
        "Round Robin allocates a fixed time quantum per process in a cyclic FIFO queue, preventing process starvation.",
        "Step 1: Copy burst times to remaining burst times\nStep 2: Cycle processes with slice quantum\nStep 3: Accumulate turnaround and waiting time",
        exp3_code,
        "Processes: [1,2,3], Burst: [10,5,8], Quantum: 2",
        "Average Waiting Time: 13.00",
        "Average Waiting Time: 13.00",
        "O(n * max_burst/quantum)",
        "O(n)",
        1, 1, 3, now, now
    ))

    # Flashcards
    cursor.execute("""
    INSERT INTO flashcards (id, experiment_id, user_id, question, answer, difficulty, times_shown, times_correct, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, ("fc-1", "exp-1", demo_user_id, "What is the best-case time complexity of optimized Bubble Sort?", "O(n) linear time, achieved when the array is already sorted and the swapped flag triggers an early exit on the first pass.", "easy", 4, 4, now))

    cursor.execute("""
    INSERT INTO flashcards (id, experiment_id, user_id, question, answer, difficulty, times_shown, times_correct, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, ("fc-2", "exp-3", demo_user_id, "Why does Round Robin scheduling eliminate starvation?", "Because every runnable process receives a bounded time slice periodically in circular FIFO sequence.", "medium", 2, 2, now))

    # Exam Schedules
    future_exam = (datetime.now(timezone.utc) + timedelta(days=6)).date().isoformat()
    cursor.execute("""
    INSERT INTO exam_schedules (id, user_id, subject_id, exam_name, exam_date, is_completed)
    VALUES (?, ?, ?, ?, ?, ?)
    """, ("exam-1", demo_user_id, sub1_id, "Data Structures Practical Examination", future_exam, 0))

    # Revision Sessions
    today = datetime.now(timezone.utc).date().isoformat()
    cursor.execute("""
    INSERT INTO revision_sessions (id, user_id, experiment_id, scheduled_date, session_type)
    VALUES (?, ?, ?, ?, ?)
    """, ("sess-1", demo_user_id, "exp-1", today, "flashcard"))

    conn.commit()


# Initialize on import
init_db()
