/* 
 * Test cases for the AI parser with multiple classes per period
 *
 * This file contains sample timetable data formats to test
 * the AI parser's ability to correctly handle scenarios where
 * multiple classes occur during the same period.
 */

// Test Case 1: Tabular format with multiple classes per period
const tabularMultiClassTest = `
         Day 1     Day 2     Day 3     Day 4     Day 5
Period 1  Math A12  English A8  Science B3  History C5  Art D1
          French C2  Spanish B6  Music D4    PE Gym     Drama E2 
Period 2  Science B3  Math A12  English A8  French C2   History C5
Period 3  History C5  Science B3  Math A12   English A8  French C2
Period 4  English A8  History C5  French C2  Math A12    Science B3
Period 5  PE Gym     Art D1      Drama E2    Music D4    Spanish B6
`;

// Test Case 2: Listing format with multiple classes per period
const listingMultiClassTest = `
Day 1:
Period 1: 
- Mathematics (Mr. Smith, Room A12)
- French (Ms. Dubois, Room C2)
Period 2: Science (Dr. Johnson, Room B3)
Period 3: History (Mrs. Thompson, Room C5)
Period 4: English (Mr. Williams, Room A8)
Period 5: PE (Coach Davis, Gymnasium)

Day 2:
Period 1:
- English (Mr. Williams, Room A8)
- Spanish (Mrs. Rodriguez, Room B6)
Period 2: Mathematics (Mr. Smith, Room A12)
Period 3: Science (Dr. Johnson, Room B3)
Period 4: History (Mrs. Thompson, Room C5)
Period 5: Art (Ms. Lee, Room D1)
`;

// Test Case 3: Complex format with different styles for different days
const complexMultiClassTest = `
STUDENT TIMETABLE - Term 2

Day 1      | Day 2      | Day 3
-------------------------------
Period 1   | 8:35-9:35
MAT101 A12 | ENG201 B4  | SCI301 C5
PHY201 D6  | CHM101 E2  | BIO301 F1

Period 2   | 9:40-10:40
ENG201 B4  | MAT101 A12 | HIS101 G3

Period 3   | 11:25-12:25
SCI301 C5  | PHY201 D6  | MAT101 A12
HIS101 G3  | BIO301 F1  | 

Period 4   | 12:30-1:30
HIS101 G3  | SCI301 C5  | ENG201 B4

Period 5   | 2:25-3:25
PE GYM     | MUSIC H1   | ART J2
DRAMA K3   |           | 
`;

// Test Case 4: Scenario with shared classes and room codes
const sharedClassesTest = `
YEAR 10 TIMETABLE
Time: 8:35-9:35
        MON(D1)  TUE(D2)  WED(D3)  THU(D4)  FRI(D5)
Group A  MAT-A12  ENG-B4   SCI-C5   HIS-G3   PE-GYM
Group B  ENG-B4   MAT-A12  HIS-G3   SCI-C5   ART-J2
Group C  SCI-C5   HIS-G3   PE-GYM   MAT-A12  ENG-B4

Time: 9:40-10:40
        MON(D1)  TUE(D2)  WED(D3)  THU(D4)  FRI(D5)
Group A  ENG-B4   SCI-C5   MAT-A12  ART-J2   HIS-G3
Group B  SCI-C5   HIS-G3   ENG-B4   PE-GYM   MAT-A12
Group C  HIS-G3   PE-GYM   ART-J2   ENG-B4   SCI-C5
`;

// Export the test cases
module.exports = {
  tabularMultiClassTest,
  listingMultiClassTest,
  complexMultiClassTest,
  sharedClassesTest
};
