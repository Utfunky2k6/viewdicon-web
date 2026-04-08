/**
 * UFÈ 200-Question Compatibility Engine
 * 10 categories × 20 questions each
 * 
 * Categories:
 * 1. Identity & Values (Q1-20)
 * 2. Family & In-laws (Q21-40)
 * 3. Children & Parenting (Q41-60)
 * 4. Money & Assets (Q61-80)
 * 5. Conflict & Discipline (Q81-100)
 * 6. Religion & Spirituality (Q101-120)
 * 7. Intimacy & Boundaries (Q121-140)
 * 8. Lifestyle & Roles (Q141-160)
 * 9. Crisis Handling (Q161-180)
 * 10. Legacy & Future Vision (Q181-200)
 */

export type AnswerType = 'MCQ' | 'TEXT' | 'SCALE'

export interface QuestionOption {
  key: string
  label: string
}

export interface Question {
  id: number
  category: string
  categoryLabel: string
  question: string
  answerType: AnswerType
  options?: QuestionOption[]
  weight: number
  conflictFlag: boolean
  dealBreaker: boolean
  hasConditional: boolean
  conditionalPrompt?: string
  station: 1 | 2 | 3
}

export const CATEGORIES = [
  { key: 'identity_values', label: 'Identity & Values', icon: '🪞', range: [1, 20] },
  { key: 'family_inlaws', label: 'Family & In-laws', icon: '👨‍👩‍👧‍👦', range: [21, 40] },
  { key: 'children_parenting', label: 'Children & Parenting', icon: '👶', range: [41, 60] },
  { key: 'money_assets', label: 'Money & Assets', icon: '💰', range: [61, 80] },
  { key: 'conflict_discipline', label: 'Conflict & Discipline', icon: '⚖️', range: [81, 100] },
  { key: 'religion_spirituality', label: 'Religion & Spirituality', icon: '🕊️', range: [101, 120] },
  { key: 'intimacy_boundaries', label: 'Intimacy & Boundaries', icon: '💛', range: [121, 140] },
  { key: 'lifestyle_roles', label: 'Lifestyle & Roles', icon: '🏠', range: [141, 160] },
  { key: 'crisis_handling', label: 'Crisis Handling', icon: '🔥', range: [161, 180] },
  { key: 'legacy_future', label: 'Legacy & Future Vision', icon: '🌍', range: [181, 200] },
] as const

const YN = [{ key: 'A', label: 'Yes' }, { key: 'B', label: 'No' }]
const YND = [{ key: 'A', label: 'Yes' }, { key: 'B', label: 'No' }, { key: 'C', label: 'It depends' }]
const COND = 'Kindly state the specific condition(s)'

function q(id: number, cat: string, catLabel: string, question: string, opts: QuestionOption[], w: number, conflict: boolean, deal: boolean, cond: boolean): Question {
  const station: 1 | 2 | 3 = id <= 40 ? 1 : id <= 120 ? 2 : 3
  return { id, category: cat, categoryLabel: catLabel, question, answerType: opts.length > 0 ? 'MCQ' : 'TEXT', options: opts.length > 0 ? opts : undefined, weight: w, conflictFlag: conflict, dealBreaker: deal, hasConditional: cond, conditionalPrompt: cond ? COND : undefined, station }
}

function qt(id: number, cat: string, catLabel: string, question: string, w: number): Question {
  const station: 1 | 2 | 3 = id <= 40 ? 1 : id <= 120 ? 2 : 3
  return { id, category: cat, categoryLabel: catLabel, question, answerType: 'TEXT', weight: w, conflictFlag: false, dealBreaker: false, hasConditional: false, station }
}

const C1 = 'identity_values', L1 = 'Identity & Values'
const C2 = 'family_inlaws', L2 = 'Family & In-laws'
const C3 = 'children_parenting', L3 = 'Children & Parenting'
const C4 = 'money_assets', L4 = 'Money & Assets'
const C5 = 'conflict_discipline', L5 = 'Conflict & Discipline'
const C6 = 'religion_spirituality', L6 = 'Religion & Spirituality'
const C7 = 'intimacy_boundaries', L7 = 'Intimacy & Boundaries'
const C8 = 'lifestyle_roles', L8 = 'Lifestyle & Roles'
const C9 = 'crisis_handling', L9 = 'Crisis Handling'
const C10 = 'legacy_future', L10 = 'Legacy & Future Vision'

export const QUESTIONS: Question[] = [
  // ═══ CATEGORY 1: Identity & Values (Q1-20) — Station 1 ═══
  q(1, C1, L1, 'Will the wife be keeping her present family name after getting married?', [{ key: 'A', label: 'Yes' }, { key: 'B', label: 'No' }, { key: 'C', label: 'Yes, in addition to the husband\'s surname' }], 2, true, false, false),
  qt(2, C1, L1, 'If it is entirely within your control, how many children will you like to have as a couple?', 2),
  q(3, C1, L1, 'If you\'ve had the number of kids you planned on having and they are all of the same sex, what next?', [{ key: 'A', label: 'We will stop having kids' }, { key: 'B', label: 'Try one more time and stop' }, { key: 'C', label: 'Go for adoption' }, { key: 'D', label: 'Go separate ways' }], 3, true, true, false),
  q(4, C1, L1, 'If several years into your marriage there are no kids, are you open to adoption?', YN, 3, true, true, false),
  qt(5, C1, L1, 'If the kids do not arrive as planned and you decide to adopt, how long will you wait before adopting?', 2),
  q(6, C1, L1, 'If medical tests reveal that either of you is the reason behind your inability to have children, will you remain married?', YND, 3, true, true, true),
  q(7, C1, L1, 'Are you willing to sever communications with current friends if either of you objects to the friendships?', YND, 2, true, false, true),
  q(8, C1, L1, 'After getting married, can either of your relatives come and live with you?', YND, 2, true, false, true),
  q(9, C1, L1, 'Can either of you continue to keep in touch with your ex(es) after getting married?', YND, 2, true, false, true),
  q(10, C1, L1, 'Will the wife be keeping her corporate job after your wedding?', YN, 2, true, false, false),
  q(11, C1, L1, 'If it becomes necessary for one of you to resign your job for the sake of the kids, how will you decide who should resign?', [{ key: 'A', label: 'The wife will resign because she is the woman' }, { key: 'B', label: 'The husband will resign if the wife does not want to' }, { key: 'C', label: 'Whoever earns less will resign' }, { key: 'D', label: 'It depends' }], 2, true, false, true),
  q(12, C1, L1, 'Are you OK with keeping a house help?', [{ key: 'A', label: 'Yes' }, { key: 'B', label: 'No' }, { key: 'C', label: 'Yes, but non-live-in' }, { key: 'D', label: 'It depends' }], 1, false, false, true),
  q(13, C1, L1, 'What type of bank accounts will you maintain after getting married?', [{ key: 'A', label: 'Separate Accounts' }, { key: 'B', label: 'Separate + Joint Account' }, { key: 'C', label: 'Joint Accounts only' }], 2, true, false, false),
  q(14, C1, L1, 'How will you want bills to be paid after getting married?', [{ key: 'A', label: 'The husband will foot all bills' }, { key: 'B', label: 'Share bills at an agreed ratio' }, { key: 'C', label: 'The man pays but can ask for help when funds are low' }], 2, true, false, false),
  q(15, C1, L1, 'Will you have access to each other\'s PIN or password for phones, ATM cards, email, and social media?', YN, 2, true, false, false),
  q(16, C1, L1, 'Will properties be bought in your names as husband and wife or as individuals?', [{ key: 'A', label: 'As individuals' }, { key: 'B', label: 'In both names as a couple' }], 2, true, false, false),
  q(17, C1, L1, 'Will both of you be privy to financial investments that either of you make?', YN, 2, true, false, false),
  q(18, C1, L1, 'Are both of you OK with either going for further studies abroad that will keep you separated for several years?', YND, 2, true, false, true),
  q(19, C1, L1, 'Do you believe in joint decision-making on purchases above a certain value?', YND, 2, false, false, true),
  q(20, C1, L1, 'If a significant financial opportunity arises that requires using joint savings, what will you do?', [{ key: 'A', label: 'Use it without consulting spouse' }, { key: 'B', label: 'Discuss before using' }, { key: 'C', label: 'It depends' }], 2, true, false, true),

  // ═══ CATEGORY 2: Family & In-laws (Q21-40) — Station 1 ═══
  q(21, C2, L2, 'Several months or years into your marriage, one of you gets a job that requires moving to another city or country. What happens?', [{ key: 'A', label: 'We move together' }, { key: 'B', label: 'We maintain two homes with visiting' }, { key: 'C', label: 'That spouse gives up the new job' }, { key: 'D', label: 'It depends' }], 2, true, false, true),
  q(22, C2, L2, 'Are you comfortable with long-term physical separation due to work?', YND, 2, true, false, true),
  q(23, C2, L2, 'How will you handle disagreements about parenting style?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Follow one spouse\'s method' }, { key: 'C', label: 'Seek professional advice' }, { key: 'D', label: 'It depends' }], 2, false, false, true),
  q(24, C2, L2, 'Are you willing to adjust your career goals for your partner?', YND, 2, true, false, true),
  q(25, C2, L2, 'Would you accept relocating to another city for your spouse\'s career?', YND, 2, true, false, true),
  q(26, C2, L2, 'Are you open to having a blended family if one of you has children from a previous relationship?', YND, 2, true, true, true),
  q(27, C2, L2, 'How important is religious alignment in your marriage?', [{ key: 'A', label: 'Very important' }, { key: 'B', label: 'Somewhat important' }, { key: 'C', label: 'Not important' }], 2, true, false, false),
  q(28, C2, L2, 'Do you expect to share all household chores equally?', YND, 1, false, false, true),
  q(29, C2, L2, 'Are you willing to take joint responsibility for extended family issues?', YND, 2, true, false, true),
  q(30, C2, L2, 'How will you handle major purchases like vehicles or property?', [{ key: 'A', label: 'Joint discussion and decision' }, { key: 'B', label: 'Individual decision' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(31, C2, L2, 'Are you comfortable with your spouse having close friends of the opposite sex?', YND, 2, true, false, true),
  q(32, C2, L2, 'How will you handle differences in political views?', [{ key: 'A', label: 'Respect each other\'s view' }, { key: 'B', label: 'Avoid discussion' }, { key: 'C', label: 'Try to influence spouse' }, { key: 'D', label: 'It depends' }], 1, false, false, true),
  q(33, C2, L2, 'Are you comfortable with financial transparency regarding salaries and expenses?', YND, 2, true, false, true),
  q(34, C2, L2, 'How will you handle unexpected emergencies like job loss or illness?', [{ key: 'A', label: 'Jointly manage' }, { key: 'B', label: 'Follow one spouse\'s plan' }, { key: 'C', label: 'Seek external help' }, { key: 'D', label: 'It depends' }], 2, false, false, true),
  q(35, C2, L2, 'Will you support each other\'s hobbies and personal interests?', YND, 1, false, false, true),
  q(36, C2, L2, 'Are you willing to follow your spouse\'s dietary preferences or restrictions?', YND, 1, false, false, true),
  q(37, C2, L2, 'Are you comfortable sharing social media accounts or posts with your spouse?', YND, 1, false, false, true),
  q(38, C2, L2, 'How will you handle disagreements on holiday destinations?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Alternate choices yearly' }, { key: 'C', label: 'One spouse decides' }, { key: 'D', label: 'It depends' }], 1, false, false, true),
  q(39, C2, L2, 'Do you expect to have pets in the household?', YND, 1, false, false, true),
  q(40, C2, L2, 'How will you handle differences in cultural or family traditions?', [{ key: 'A', label: 'Respect each other\'s traditions' }, { key: 'B', label: 'Adopt one spouse\'s traditions' }, { key: 'C', label: 'Create new traditions together' }, { key: 'D', label: 'It depends' }], 2, true, false, true),

  // ═══ CATEGORY 3: Children & Parenting (Q41-60) — Station 2 ═══
  q(41, C3, L3, 'Are you willing to attend marriage enrichment programs together?', YND, 1, false, false, true),
  q(42, C3, L3, 'How would you handle differences in love languages?', [{ key: 'A', label: 'Adapt to each other' }, { key: 'B', label: 'Ignore differences' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(43, C3, L3, 'Are you comfortable with each spouse having personal savings separate from joint accounts?', YND, 2, true, false, true),
  q(44, C3, L3, 'Will you support each other during career setbacks or failures?', YND, 2, true, false, true),
  q(45, C3, L3, 'Are you willing to compromise on personal hobbies to spend more time together?', YND, 1, false, false, true),
  q(46, C3, L3, 'Are you comfortable with social media sharing about your married life?', YND, 1, false, false, true),
  q(47, C3, L3, 'Do you agree to regular date nights to strengthen your marriage?', YND, 1, false, false, true),
  q(48, C3, L3, 'Are you willing to adjust your sleep schedules to accommodate each other?', YND, 1, false, false, true),
  q(49, C3, L3, 'How will you handle financial disagreements?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Follow one spouse\'s decision' }, { key: 'C', label: 'Seek financial counselling' }, { key: 'D', label: 'It depends' }], 2, true, false, true),
  q(50, C3, L3, 'How will you handle differences in parenting styles?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Follow one spouse\'s style' }, { key: 'C', label: 'Seek professional advice' }, { key: 'D', label: 'It depends' }], 2, true, false, true),
  q(51, C3, L3, 'Will you support each other in pursuing new business ventures?', YND, 2, false, false, true),
  q(52, C3, L3, 'How will you handle disagreements with extended family members?', [{ key: 'A', label: 'Discuss together and resolve' }, { key: 'B', label: 'Avoid confrontation' }, { key: 'C', label: 'Set boundaries' }, { key: 'D', label: 'It depends' }], 2, true, false, true),
  q(53, C3, L3, 'Are you willing to attend counseling or therapy if marital issues arise?', YND, 2, true, false, true),
  q(54, C3, L3, 'How will you handle situations where one spouse earns significantly more?', [{ key: 'A', label: 'Share equally' }, { key: 'B', label: 'Proportional contribution' }, { key: 'C', label: 'Higher earner decides' }, { key: 'D', label: 'It depends' }], 2, true, false, true),
  q(55, C3, L3, 'Are you willing to relocate if one spouse\'s career requires it?', YND, 2, true, false, true),
  q(56, C3, L3, 'Will you involve each other in major career decisions?', YND, 2, true, false, true),
  q(57, C3, L3, 'How will you handle situations where one spouse needs personal space?', [{ key: 'A', label: 'Respect the need' }, { key: 'B', label: 'Discuss and compromise' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(58, C3, L3, 'Are you comfortable with spending holidays separately due to commitments?', YND, 1, false, false, true),
  q(59, C3, L3, 'Will you support each other in maintaining friendships outside the marriage?', YND, 1, false, false, true),
  q(60, C3, L3, 'How will you handle situations where one spouse wants to pursue higher education?', [{ key: 'A', label: 'Support fully' }, { key: 'B', label: 'Only if convenient' }, { key: 'C', label: 'It depends' }], 2, false, false, true),

  // ═══ CATEGORY 4: Money & Assets (Q61-80) — Station 2 ═══
  q(61, C4, L4, 'Are you willing to share household responsibilities equally?', YND, 1, false, false, true),
  q(62, C4, L4, 'How will you handle differences in spending habits?', [{ key: 'A', label: 'Budget together' }, { key: 'B', label: 'Allow personal discretion' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(63, C4, L4, 'Are you comfortable with public displays of affection?', YND, 1, false, false, true),
  q(64, C4, L4, 'How will you handle situations where one spouse is stressed or overwhelmed?', [{ key: 'A', label: 'Offer support' }, { key: 'B', label: 'Leave them alone' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(65, C4, L4, 'Are you willing to discuss and agree on family planning methods?', YND, 2, true, false, true),
  q(66, C4, L4, 'How will you handle differences in religious practices or beliefs?', [{ key: 'A', label: 'Respect each other\'s beliefs' }, { key: 'B', label: 'Compromise on practices' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(67, C4, L4, 'Are you willing to adjust your lifestyle to accommodate your spouse\'s health needs?', YND, 2, true, false, true),
  q(68, C4, L4, 'How will you handle a spouse wanting a long vacation or sabbatical?', [{ key: 'A', label: 'Support fully' }, { key: 'B', label: 'Negotiate timing' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(69, C4, L4, 'Are you comfortable discussing financial mistakes or debts openly?', YND, 2, true, false, true),
  q(70, C4, L4, 'How will you handle disagreements over raising children?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Follow one parent\'s decision' }, { key: 'C', label: 'Seek external advice' }, { key: 'D', label: 'It depends' }], 2, true, false, true),
  q(71, C4, L4, 'Are you willing to take turns caring for sick children or family members?', YND, 1, false, false, true),
  q(72, C4, L4, 'How will you handle differences in political opinions?', [{ key: 'A', label: 'Respect each other\'s views' }, { key: 'B', label: 'Avoid political discussions' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(73, C4, L4, 'Are you comfortable with hosting social events at home together?', YND, 1, false, false, true),
  q(74, C4, L4, 'Will you actively support each other\'s hobbies or passions?', YND, 1, false, false, true),
  q(75, C4, L4, 'Are you willing to forgive mistakes quickly to maintain peace?', YND, 2, true, false, true),
  q(76, C4, L4, 'How will you handle situations where one spouse feels neglected?', [{ key: 'A', label: 'Discuss openly' }, { key: 'B', label: 'Take actions proactively' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(77, C4, L4, 'Are you willing to celebrate each other\'s achievements publicly?', YND, 1, false, false, true),
  q(78, C4, L4, 'How will you handle disagreements over household décor or design?', [{ key: 'A', label: 'Compromise together' }, { key: 'B', label: 'Follow one spouse\'s choice' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(79, C4, L4, 'Are you willing to adjust routines for religious observances or fasting?', YND, 2, true, false, true),
  q(80, C4, L4, 'How will you handle unexpected financial emergencies?', [{ key: 'A', label: 'Jointly resolve' }, { key: 'B', label: 'Individually handle' }, { key: 'C', label: 'It depends' }], 2, true, false, true),

  // ═══ CATEGORY 5: Conflict & Discipline (Q81-100) — Station 2 ═══
  q(81, C5, L5, 'How do you plan to resolve conflicts when both of you have opposing views?', [{ key: 'A', label: 'Discussion until agreement' }, { key: 'B', label: 'Seek counsel from family or friends' }, { key: 'C', label: 'Counselling' }, { key: 'D', label: 'It depends' }], 2, true, false, true),
  q(82, C5, L5, 'Are you willing to attend couples\' counselling if conflicts escalate?', YN, 2, true, false, false),
  q(83, C5, L5, 'Would you consider premarital sex a deal breaker?', YND, 2, true, true, true),
  q(84, C5, L5, 'Are you comfortable with each spouse having personal privacy online?', YND, 1, false, false, true),
  q(85, C5, L5, 'How will you handle situations where one spouse wants to change careers?', [{ key: 'A', label: 'Full support' }, { key: 'B', label: 'Partial support' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(86, C5, L5, 'Are you willing to discuss family boundaries for visiting relatives?', YND, 2, true, false, true),
  q(87, C5, L5, 'How will you handle long-distance situations if one spouse travels frequently?', [{ key: 'A', label: 'Maintain communication' }, { key: 'B', label: 'Accept separation' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(88, C5, L5, 'Are you comfortable with sharing childcare responsibilities equally?', YND, 1, false, false, true),
  q(89, C5, L5, 'How will you handle situations where one spouse wants to change religion?', [{ key: 'A', label: 'Respect the decision' }, { key: 'B', label: 'Discuss and compromise' }, { key: 'C', label: 'It depends' }], 2, true, true, true),
  q(90, C5, L5, 'Are you willing to support each other in maintaining health and fitness?', YND, 1, false, false, true),
  q(91, C5, L5, 'How will you handle one spouse wanting to pursue a new time-consuming hobby?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate time' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(92, C5, L5, 'Are you comfortable with each spouse having separate bank accounts?', YND, 2, true, false, true),
  q(93, C5, L5, 'How will you handle one spouse wanting to host friends frequently?', [{ key: 'A', label: 'Support it' }, { key: 'B', label: 'Set limits' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(94, C5, L5, 'Are you willing to discuss and agree on vacation destinations together?', YND, 1, false, false, true),
  q(95, C5, L5, 'How will you handle differences in sleep patterns or bedtime routines?', [{ key: 'A', label: 'Compromise' }, { key: 'B', label: 'Keep separate schedules' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(96, C5, L5, 'Are you comfortable with each spouse having personal time for solo activities?', YND, 1, false, false, true),
  q(97, C5, L5, 'How will you handle disagreements over social media usage?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Follow one spouse\'s rules' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(98, C5, L5, 'Are you willing to discuss and agree on celebrating anniversaries and birthdays?', YND, 1, false, false, true),
  q(99, C5, L5, 'How will you handle differences in cleanliness and tidiness habits?', [{ key: 'A', label: 'Compromise' }, { key: 'B', label: 'Assign responsibilities' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(100, C5, L5, 'Are you comfortable with sharing responsibilities for grocery shopping and meal prep?', YND, 1, false, false, true),

  // ═══ CATEGORY 6: Religion & Spirituality (Q101-120) — Station 2 ═══
  q(101, C6, L6, 'If both of you are Christians, do you presently attend the same church?', YN, 2, true, false, false),
  q(102, C6, L6, 'If you attend different churches, which church will you attend after marriage?', [{ key: 'A', label: 'The man\'s church' }, { key: 'B', label: 'The wife\'s church' }, { key: 'C', label: 'Continue attending separate churches' }, { key: 'D', label: 'A new church' }], 2, true, false, false),
  q(103, C6, L6, 'How will you handle differences in spiritual or religious practices at home?', [{ key: 'A', label: 'Respect each other' }, { key: 'B', label: 'Compromise' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(104, C6, L6, 'Are you comfortable with each spouse making independent health decisions?', YND, 1, false, false, true),
  q(105, C6, L6, 'How will you handle differences in communication styles (direct vs. indirect)?', [{ key: 'A', label: 'Discuss and adjust' }, { key: 'B', label: 'Accept as is' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(106, C6, L6, 'Are you willing to discuss and agree on technology usage limits at home?', YND, 1, false, false, true),
  q(107, C6, L6, 'How will you handle disagreements about children\'s education or school choices?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Follow one parent\'s decision' }, { key: 'C', label: 'Seek external advice' }, { key: 'D', label: 'It depends' }], 2, true, false, true),
  q(108, C6, L6, 'Are you willing to discuss and agree on financial priorities for large purchases?', YND, 2, true, false, true),
  q(109, C6, L6, 'How will you handle one spouse wanting to volunteer or do community service regularly?', [{ key: 'A', label: 'Support fully' }, { key: 'B', label: 'Negotiate time commitment' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(110, C6, L6, 'Are you comfortable with each spouse having personal friends of the opposite sex?', YND, 2, true, false, true),
  q(111, C6, L6, 'How will you handle differences in political involvement?', [{ key: 'A', label: 'Respect each other' }, { key: 'B', label: 'Avoid discussions' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(112, C6, L6, 'Are you willing to discuss and agree on vacation budgets?', YND, 1, false, false, true),
  q(113, C6, L6, 'How will you handle one spouse wanting to work from home frequently?', [{ key: 'A', label: 'Support fully' }, { key: 'B', label: 'Negotiate schedule' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(114, C6, L6, 'Are you comfortable with open discussions about sexual health and wellbeing?', YND, 2, true, false, true),
  q(115, C6, L6, 'How will you handle differences in dietary preferences or restrictions?', [{ key: 'A', label: 'Compromise' }, { key: 'B', label: 'Maintain separate meals' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(116, C6, L6, 'Are you willing to discuss and agree on daily routines and schedules?', YND, 1, false, false, true),
  q(117, C6, L6, 'How will you handle disagreements about visiting extended family frequently?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Limit visits' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(118, C6, L6, 'Are you comfortable with discussing inheritance and family wealth openly?', YND, 2, true, false, true),
  q(119, C6, L6, 'How will you handle one spouse wanting to change residence?', [{ key: 'A', label: 'Support fully' }, { key: 'B', label: 'Negotiate timing' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(120, C6, L6, 'Are you willing to support each other in learning new skills or hobbies?', YND, 1, false, false, true),

  // ═══ CATEGORY 7: Intimacy & Boundaries (Q121-140) — Station 3 ═══
  q(121, C7, L7, 'How often would you want to have sex in marriage?', [{ key: 'A', label: 'Every day' }, { key: 'B', label: 'Twice/Thrice a week' }, { key: 'C', label: 'Once a week' }, { key: 'D', label: 'It depends' }], 2, true, false, true),
  q(122, C7, L7, 'Will you be having oral sex after getting married?', YN, 2, true, false, false),
  q(123, C7, L7, 'Will you be having anal sex after getting married?', YN, 2, true, false, false),
  q(124, C7, L7, 'Are you comfortable discussing sexual preferences openly?', YND, 2, true, false, true),
  q(125, C7, L7, 'Are you comfortable with discussing sexual boundaries openly?', YND, 2, true, false, true),
  q(126, C7, L7, 'Are you comfortable with discussing intimate matters openly?', YND, 2, true, false, true),
  q(127, C7, L7, 'Are you comfortable with open discussions about sexual preferences?', YND, 2, true, false, true),
  q(128, C7, L7, 'Are you willing to discuss and agree on family planning methods and timing?', YND, 2, true, false, true),
  q(129, C7, L7, 'How will you handle disagreements about hosting celebrations or ceremonies?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Follow one spouse\'s preference' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(130, C7, L7, 'Are you comfortable with taking turns making major household decisions?', YND, 1, false, false, true),
  q(131, C7, L7, 'How will you handle one spouse wanting to pursue higher education abroad?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate timing' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(132, C7, L7, 'Are you willing to discuss and agree on the division of chores?', YND, 1, false, false, true),
  q(133, C7, L7, 'How will you handle differences in spending on gifts or celebrations?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Set limits' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(134, C7, L7, 'Are you comfortable with each spouse having private time for reflection?', YND, 1, false, false, true),
  q(135, C7, L7, 'How will you handle disagreements over the choice of home location?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Follow one spouse\'s preference' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(136, C7, L7, 'Are you willing to discuss and agree on spending for children\'s education?', YND, 2, true, false, true),
  q(137, C7, L7, 'How will you handle one spouse wanting to change career paths?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate timing' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(138, C7, L7, 'Are you comfortable with each spouse maintaining separate hobbies or clubs?', YND, 1, false, false, true),
  q(139, C7, L7, 'How will you handle differences in vacation planning or preferences?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Alternate decisions' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(140, C7, L7, 'Are you willing to discuss and agree on methods for handling financial emergencies?', YND, 2, true, false, true),

  // ═══ CATEGORY 8: Lifestyle & Roles (Q141-160) — Station 3 ═══
  q(141, C8, L8, 'How will you handle one spouse wanting to pursue a public-facing career?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate boundaries' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(142, C8, L8, 'Are you comfortable with open discussions about personal values and priorities?', YND, 1, false, false, true),
  q(143, C8, L8, 'How will you handle one spouse wanting to start a business?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate involvement' }, { key: 'C', label: 'It depends' }], 2, false, false, true),
  q(144, C8, L8, 'Are you comfortable with each spouse having personal digital devices for private use?', YND, 1, false, false, true),
  q(145, C8, L8, 'How will you handle differences in home decoration or interior design?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Alternate decisions' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(146, C8, L8, 'Are you willing to discuss and agree on social gatherings with extended family?', YND, 1, false, false, true),
  q(147, C8, L8, 'How will you handle disagreements about attending family events?', [{ key: 'A', label: 'Attend together' }, { key: 'B', label: 'Alternate attendance' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(148, C8, L8, 'Are you willing to discuss and agree on child-rearing methods and discipline?', YND, 2, true, false, true),
  q(149, C8, L8, 'How will you handle differences in personal hygiene routines?', [{ key: 'A', label: 'Compromise' }, { key: 'B', label: 'Follow one spouse\'s routine' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(150, C8, L8, 'Are you comfortable with both spouses making independent career decisions?', YND, 1, false, false, true),
  q(151, C8, L8, 'How will you handle disagreements about celebrating cultural or religious holidays?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Alternate preferences' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(152, C8, L8, 'How will you handle one spouse wanting to take sabbatical or extended leave?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate timing' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(153, C8, L8, 'Are you comfortable with discussing expectations around financial transparency?', YND, 2, true, false, true),
  q(154, C8, L8, 'How will you handle one spouse wanting to pursue a spiritual calling?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate involvement' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(155, C8, L8, 'Are you willing to discuss and agree on weekend or leisure activities together?', YND, 1, false, false, true),
  q(156, C8, L8, 'How will you handle disagreements about household repairs and maintenance?', [{ key: 'A', label: 'Divide responsibilities' }, { key: 'B', label: 'Hire help' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(157, C8, L8, 'Are you comfortable with sharing personal passwords and digital access?', YND, 2, true, false, true),
  q(158, C8, L8, 'How will you handle differences in food preferences or cooking styles?', [{ key: 'A', label: 'Compromise' }, { key: 'B', label: 'Maintain separate meals' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(159, C8, L8, 'Are you willing to discuss and agree on physical fitness or exercise routines?', YND, 1, false, false, true),
  q(160, C8, L8, 'How will you handle one spouse wanting to engage in competitive sports?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate schedule' }, { key: 'C', label: 'It depends' }], 1, false, false, true),

  // ═══ CATEGORY 9: Crisis Handling (Q161-180) — Station 3 ═══
  qt(161, C9, L9, 'What is the one thing that the husband will do that will lead to an end of the marriage?', 3),
  qt(162, C9, L9, 'What is the one thing that the wife will do that will lead to an end of the marriage?', 3),
  q(163, C9, L9, 'Sometimes one\'s spouse may make a significant career change (e.g., going into ministry). Are you okay with such change?', YND, 2, true, false, true),
  q(164, C9, L9, 'Are you comfortable with discussing and agreeing on limits for screen time?', YND, 1, false, false, true),
  q(165, C9, L9, 'How will you handle differences in taste in entertainment or hobbies?', [{ key: 'A', label: 'Compromise' }, { key: 'B', label: 'Alternate choices' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(166, C9, L9, 'Are you willing to discuss and agree on family traditions to maintain?', YND, 2, true, false, true),
  q(167, C9, L9, 'How will you handle one spouse wanting to take a leadership role in a community?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate involvement' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(168, C9, L9, 'Are you comfortable with discussing financial contributions to household openly?', YND, 2, true, false, true),
  q(169, C9, L9, 'How will you handle differences in religious practices for children?', [{ key: 'A', label: 'Follow one parent\'s practice' }, { key: 'B', label: 'Compromise' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(170, C9, L9, 'Are you willing to discuss and agree on boundaries for visiting friends?', YND, 1, false, false, true),
  q(171, C9, L9, 'How will you handle disagreements about household décor or aesthetics?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Alternate decisions' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(172, C9, L9, 'Are you comfortable with discussing and agreeing on family emergency plans?', YND, 2, false, false, true),
  q(173, C9, L9, 'How will you handle one spouse wanting to adopt new pets?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(174, C9, L9, 'Are you willing to discuss and agree on travel frequency and destinations?', YND, 1, false, false, true),
  q(175, C9, L9, 'How will you handle differences in generosity or gift-giving habits?', [{ key: 'A', label: 'Compromise' }, { key: 'B', label: 'Alternate approaches' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(176, C9, L9, 'How will you handle disagreements about hosting guests at home?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate frequency' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(177, C9, L9, 'Are you willing to discuss and agree on childcare arrangements?', YND, 2, true, false, true),
  q(178, C9, L9, 'How will you handle one spouse wanting to continue education while married?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate schedule' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(179, C9, L9, 'Are you comfortable with discussing limits on social outings?', YND, 1, false, false, true),
  q(180, C9, L9, 'How will you handle differences in sleep schedules or routines?', [{ key: 'A', label: 'Compromise' }, { key: 'B', label: 'Maintain separate routines' }, { key: 'C', label: 'It depends' }], 1, false, false, true),

  // ═══ CATEGORY 10: Legacy & Future Vision (Q181-200) — Station 3 ═══
  q(181, C10, L10, 'Are you willing to discuss and agree on savings and investment strategies?', YND, 2, true, false, true),
  q(182, C10, L10, 'How will you handle one spouse wanting to participate in public speaking or events?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate time' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(183, C10, L10, 'Are you comfortable with discussing limits on personal spending?', YND, 2, true, false, true),
  q(184, C10, L10, 'How will you handle differences in hobbies or personal interests?', [{ key: 'A', label: 'Compromise' }, { key: 'B', label: 'Alternate choices' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(185, C10, L10, 'Are you willing to discuss and agree on frequency of family visits?', YND, 2, true, false, true),
  q(186, C10, L10, 'How will you handle one spouse wanting to relocate for a better lifestyle?', [{ key: 'A', label: 'Fully support' }, { key: 'B', label: 'Negotiate timing' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(187, C10, L10, 'Are you comfortable with discussing and agreeing on personal privacy boundaries?', YND, 2, true, false, true),
  q(188, C10, L10, 'How will you handle disagreements about major purchases like vehicles?', [{ key: 'A', label: 'Discuss and compromise' }, { key: 'B', label: 'Alternate decisions' }, { key: 'C', label: 'It depends' }], 2, true, false, true),
  q(189, C10, L10, 'Are you willing to discuss and agree on household cleaning responsibilities?', YND, 1, false, false, true),
  q(190, C10, L10, 'How will you handle differences in family meal routines or traditions?', [{ key: 'A', label: 'Compromise' }, { key: 'B', label: 'Alternate routines' }, { key: 'C', label: 'It depends' }], 1, false, false, true),
  q(191, C10, L10, 'Are you comfortable with open discussions about life goals and aspirations?', YND, 2, true, false, true),
  q(192, C10, L10, 'How will you build a shared legacy as a couple?', YND, 2, true, false, true),
  q(193, C10, L10, 'Are you willing to plan retirement and old age together intentionally?', YND, 2, true, false, true),
  q(194, C10, L10, 'How will you handle passing down cultural traditions to your children?', [{ key: 'A', label: 'Actively teach both cultures' }, { key: 'B', label: 'Follow one family\'s traditions' }, { key: 'C', label: 'Let children choose' }, { key: 'D', label: 'It depends' }], 2, true, false, true),
  q(195, C10, L10, 'Are you willing to build and maintain relationships with your spouse\'s community?', YND, 2, true, false, true),
  q(196, C10, L10, 'How will you ensure your marriage stays strong over decades?', [{ key: 'A', label: 'Regular counselling/retreats' }, { key: 'B', label: 'Date nights and quality time' }, { key: 'C', label: 'Prayer/spiritual growth together' }, { key: 'D', label: 'All of the above' }], 2, false, false, false),
  q(197, C10, L10, 'Are you willing to write a family mission statement together?', YND, 1, false, false, true),
  q(198, C10, L10, 'How do you envision your family contributing to your community?', [{ key: 'A', label: 'Volunteering and service' }, { key: 'B', label: 'Financial giving' }, { key: 'C', label: 'Mentoring the next generation' }, { key: 'D', label: 'All of the above' }], 1, false, false, false),
  q(199, C10, L10, 'What is the most important value you want your marriage to represent?', YND, 2, true, false, true),
  q(200, C10, L10, 'Are you ready to commit to building a lifelong partnership with intention, trust, and cultural depth?', YN, 3, false, false, false),
]

/** Get questions for a specific station */
export function getStationQuestions(station: 1 | 2 | 3): Question[] {
  return QUESTIONS.filter(q => q.station === station)
}

/** Get questions for a specific category */
export function getCategoryQuestions(category: string): Question[] {
  return QUESTIONS.filter(q => q.category === category)
}

/** Get a single question by ID */
export function getQuestion(id: number): Question | undefined {
  return QUESTIONS.find(q => q.id === id)
}
