// ═══════════════════════════════════════════════════════════════════
// UFÈ REALM — 200 Marriage Questions · African Cultural Context
// Station 1 (Alignment): 40 Qs · Station 2 (Truth): 80 Qs · Station 3 (Commitment): 80 Qs
// ═══════════════════════════════════════════════════════════════════

export type AnswerType = 'MCQ' | 'TEXT' | 'SCALE' | 'MCQ_EXPLAIN'

export type QuestionCategory =
  | 'IDENTITY_VALUES'
  | 'FAMILY_INLAWS'
  | 'CHILDREN_PARENTING'
  | 'MONEY_ASSETS'
  | 'CONFLICT_DISCIPLINE'
  | 'RELIGION_SPIRITUALITY'
  | 'INTIMACY_BOUNDARIES'
  | 'LIFESTYLE_ROLES'
  | 'CRISIS_HANDLING'
  | 'LEGACY_FUTURE'

export interface LoveQuestion {
  id: string
  station: 1 | 2 | 3
  category: QuestionCategory
  answerType: AnswerType
  question: string
  choices?: string[]
  scaleLabels?: [string, string]
  explanation?: string
  culturalNote?: string
}

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  IDENTITY_VALUES: 'Identity & Values',
  FAMILY_INLAWS: 'Family & In-Laws',
  CHILDREN_PARENTING: 'Children & Parenting',
  MONEY_ASSETS: 'Money & Assets',
  CONFLICT_DISCIPLINE: 'Conflict & Discipline',
  RELIGION_SPIRITUALITY: 'Religion & Spirituality',
  INTIMACY_BOUNDARIES: 'Intimacy & Boundaries',
  LIFESTYLE_ROLES: 'Lifestyle & Roles',
  CRISIS_HANDLING: 'Crisis Handling',
  LEGACY_FUTURE: 'Legacy & Future Vision',
}

export const STATION_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Alignment',
  2: 'Truth',
  3: 'Commitment',
}

// ═══════════════════════════════════════════════════════════════════
// STATION 1 — ALIGNMENT (40 questions)
// Lighter questions · Get-to-know · 5 categories × 8
// ═══════════════════════════════════════════════════════════════════

const STATION_1: LoveQuestion[] = [
  // ── IDENTITY & VALUES (8) ──
  { id: 'IV01', station: 1, category: 'IDENTITY_VALUES', answerType: 'MCQ_EXPLAIN', question: 'If we marry, whose family name do we use? Should children carry both clan names or one?', choices: ['My family name only', 'Your family name only', 'Both hyphenated', 'Children choose when older'], culturalNote: 'In Yoruba tradition, oriki praise names carry lineage power. Among the Akan, children inherit the mother\'s clan.' },
  { id: 'IV02', station: 1, category: 'IDENTITY_VALUES', answerType: 'MCQ', question: 'What does "home" mean to you as an African person?', choices: ['Where my parents built', 'Where I live now', 'Wherever my family is', 'My ancestral village'], culturalNote: 'Many Africans maintain strong ties to ancestral homelands regardless of where they reside.' },
  { id: 'IV03', station: 1, category: 'IDENTITY_VALUES', answerType: 'SCALE', question: 'How important is it that your partner shares your ethnic or tribal background?', scaleLabels: ['Not important at all', 'Absolutely essential'], culturalNote: 'Interethnic marriages are increasingly common but can face family resistance in some communities.' },
  { id: 'IV04', station: 1, category: 'IDENTITY_VALUES', answerType: 'TEXT', question: 'What three values did your parents or grandparents teach you that you will carry into marriage?', explanation: 'Think about the proverbs, habits, and unspoken rules in your household.' },
  { id: 'IV05', station: 1, category: 'IDENTITY_VALUES', answerType: 'MCQ', question: 'If you live in the diaspora, would you ever consider repatriating to Africa permanently?', choices: ['Yes, already planning', 'Possibly, but uncertain', 'Only for retirement', 'No, my life is abroad'], culturalNote: 'The "Year of Return" movement inspired many diaspora Africans to rethink where they build their lives.' },
  { id: 'IV06', station: 1, category: 'IDENTITY_VALUES', answerType: 'MCQ_EXPLAIN', question: 'How do you feel about traditional vs civil vs religious marriage ceremonies?', choices: ['Traditional only', 'Civil + Traditional', 'Religious + Traditional', 'All three ceremonies'], culturalNote: 'In Nigeria alone, marriages can involve traditional rites, court registry, and church/mosque ceremonies — each with its own legal weight.' },
  { id: 'IV07', station: 1, category: 'IDENTITY_VALUES', answerType: 'SCALE', question: 'How connected are you to your cultural heritage practices (festivals, language, attire)?', scaleLabels: ['Very detached', 'Deeply rooted'] },
  { id: 'IV08', station: 1, category: 'IDENTITY_VALUES', answerType: 'TEXT', question: 'What does a successful marriage look like in your family? Describe a marriage you admire and why.', explanation: 'This reveals your internal model of what marriage should be.' },

  // ── FAMILY & IN-LAWS (8) ──
  { id: 'FI01', station: 1, category: 'FAMILY_INLAWS', answerType: 'MCQ_EXPLAIN', question: 'How involved should your mother-in-law be in your married life?', choices: ['She is welcome to live with us', 'Regular visits but separate homes', 'Holidays and occasions only', 'Minimal involvement'], culturalNote: 'In many African cultures, the mother-in-law holds significant influence. This question prevents future conflict.' },
  { id: 'FI02', station: 1, category: 'FAMILY_INLAWS', answerType: 'SCALE', question: 'How often should we visit your family village or hometown?', scaleLabels: ['Once a year at most', 'Every month'], culturalNote: 'Hometown association duties, family ceremonies, and burial preparations often require regular visits.' },
  { id: 'FI03', station: 1, category: 'FAMILY_INLAWS', answerType: 'MCQ', question: 'Your younger sibling needs school fees. How should we handle it?', choices: ['We pay without question — family first', 'We help if our budget allows', 'They should apply for loans/scholarships', 'Not our responsibility'], culturalNote: 'Extended family financial obligations are a leading cause of marital tension across Africa.' },
  { id: 'FI04', station: 1, category: 'FAMILY_INLAWS', answerType: 'TEXT', question: 'What role does your extended family compound play in your life? Do you send money home regularly?', explanation: 'Be honest — money sent home is one of the biggest marriage conflicts.' },
  { id: 'FI05', station: 1, category: 'FAMILY_INLAWS', answerType: 'MCQ', question: 'How do you feel about relatives staying with you for extended periods?', choices: ['My home is their home', 'Short visits (max 2 weeks)', 'Only in emergencies', 'I prefer privacy — hotels exist'], culturalNote: 'The African open-door policy for relatives is beautiful but requires partner alignment.' },
  { id: 'FI06', station: 1, category: 'FAMILY_INLAWS', answerType: 'MCQ_EXPLAIN', question: 'What are your views on bride price / lobola / dowry?', choices: ['Important tradition — must be done properly', 'Symbolic gesture is fine', 'Modern couples can skip it', 'I find it problematic'], culturalNote: 'Bride price ranges from symbolic to life-changing amounts depending on ethnic group and family expectations.' },
  { id: 'FI07', station: 1, category: 'FAMILY_INLAWS', answerType: 'SCALE', question: 'How much weight should your parents\' approval carry in our relationship decisions?', scaleLabels: ['Their opinion is advisory only', 'Their blessing is mandatory'] },
  { id: 'FI08', station: 1, category: 'FAMILY_INLAWS', answerType: 'TEXT', question: 'Has your family ever opposed a relationship you were in? What happened and what did you learn?', explanation: 'This reveals whether they prioritize family approval or personal choice.' },

  // ── RELIGION & SPIRITUALITY (8) ──
  { id: 'RS01', station: 1, category: 'RELIGION_SPIRITUALITY', answerType: 'MCQ_EXPLAIN', question: 'What is your spiritual or religious practice?', choices: ['Christianity', 'Islam', 'African Traditional Religion', 'Spiritual but not religious'], culturalNote: 'Many Africans blend Abrahamic faiths with traditional practices — this is normal and should be discussed openly.' },
  { id: 'RS02', station: 1, category: 'RELIGION_SPIRITUALITY', answerType: 'SCALE', question: 'How important is faith or spiritual practice in your daily life?', scaleLabels: ['Not important', 'Central to everything I do'] },
  { id: 'RS03', station: 1, category: 'RELIGION_SPIRITUALITY', answerType: 'MCQ', question: 'Could you marry someone from a different faith?', choices: ['Yes — love transcends religion', 'Yes, if they respect mine', 'Only certain faiths', 'No — we must share faith'] },
  { id: 'RS04', station: 1, category: 'RELIGION_SPIRITUALITY', answerType: 'TEXT', question: 'How would we raise children spiritually? Would they follow one faith or explore multiple?', explanation: 'Interfaith marriages need clear agreements about children\'s spiritual upbringing.' },
  { id: 'RS05', station: 1, category: 'RELIGION_SPIRITUALITY', answerType: 'MCQ', question: 'How do you feel about consulting traditional healers, diviners, or herbalists?', choices: ['I consult regularly', 'Open to it in tough times', 'Only for cultural events', 'Completely against it'], culturalNote: 'Traditional spiritual practices remain deeply woven into African healthcare and decision-making.' },
  { id: 'RS06', station: 1, category: 'RELIGION_SPIRITUALITY', answerType: 'MCQ_EXPLAIN', question: 'Should tithing or religious financial obligations come before household savings?', choices: ['Yes — God comes first', 'A fixed percentage after bills', 'When we can afford it', 'I don\'t believe in mandatory giving'] },
  { id: 'RS07', station: 1, category: 'RELIGION_SPIRITUALITY', answerType: 'SCALE', question: 'How often should we attend religious services together as a couple?', scaleLabels: ['Never — it\'s personal', 'Every single service together'] },
  { id: 'RS08', station: 1, category: 'RELIGION_SPIRITUALITY', answerType: 'TEXT', question: 'What spiritual practices give you peace? Fasting, prayer, meditation, ancestral veneration?', explanation: 'Understanding each other\'s spiritual anchors prevents dismissal of what matters deeply.' },

  // ── LIFESTYLE & ROLES (8) ──
  { id: 'LR01', station: 1, category: 'LIFESTYLE_ROLES', answerType: 'MCQ', question: 'Who should cook in the marriage?', choices: ['Whoever is home first', 'We share equally', 'The wife primarily', 'We hire help'], culturalNote: 'Kitchen expectations are deeply gendered in many African homes — talking early prevents resentment.' },
  { id: 'LR02', station: 1, category: 'LIFESTYLE_ROLES', answerType: 'MCQ_EXPLAIN', question: 'Do you believe the wife should work outside the home?', choices: ['Absolutely — her career matters', 'Part-time is ideal', 'Only if we need the income', 'She should focus on the home'], culturalNote: 'This question must be answered honestly. Career suppression is a major source of regret.' },
  { id: 'LR03', station: 1, category: 'LIFESTYLE_ROLES', answerType: 'SCALE', question: 'How important is it that we live in the same city or country at all times?', scaleLabels: ['Long-distance is fine', 'Must be together always'] },
  { id: 'LR04', station: 1, category: 'LIFESTYLE_ROLES', answerType: 'TEXT', question: 'Describe your ideal typical weekday and weekend as a married person.', explanation: 'This reveals lifestyle expectations: early riser vs night owl, homebody vs social, structured vs spontaneous.' },
  { id: 'LR05', station: 1, category: 'LIFESTYLE_ROLES', answerType: 'MCQ', question: 'How do you feel about domestic staff (nannies, house help, drivers)?', choices: ['Essential — it takes a village', 'For occasional help', 'Only when children arrive', 'We handle everything ourselves'], culturalNote: 'Domestic help is standard in much of Africa. Diaspora couples often disagree on this.' },
  { id: 'LR06', station: 1, category: 'LIFESTYLE_ROLES', answerType: 'MCQ', question: 'How should housework be divided?', choices: ['50/50 split on all tasks', 'Divide by preference/skill', 'Traditional gender roles', 'Hire someone for everything'] },
  { id: 'LR07', station: 1, category: 'LIFESTYLE_ROLES', answerType: 'SCALE', question: 'How social are you? How often should we host guests or attend events?', scaleLabels: ['Very introverted — rarely', 'Love hosting every weekend'] },
  { id: 'LR08', station: 1, category: 'LIFESTYLE_ROLES', answerType: 'TEXT', question: 'What are your dietary preferences or restrictions? Any foods you expect your spouse to prepare?', explanation: 'Food is love in African culture. Expectations around cuisine matter deeply.' },

  // ── LEGACY & FUTURE (8) ──
  { id: 'LF01', station: 1, category: 'LEGACY_FUTURE', answerType: 'TEXT', question: 'When you are 70 years old, looking back on our marriage — what does success look like?', explanation: 'This reveals the ultimate vision: wealth, love, children, community impact, or spiritual fulfillment.' },
  { id: 'LF02', station: 1, category: 'LEGACY_FUTURE', answerType: 'MCQ', question: 'Where do you want to grow old?', choices: ['In Africa — going back to build', 'Abroad — with visits home', 'Wherever our children are', 'Haven\'t decided yet'] },
  { id: 'LF03', station: 1, category: 'LEGACY_FUTURE', answerType: 'SCALE', question: 'How important is building generational wealth for your future family?', scaleLabels: ['Not a priority', 'My primary life mission'], culturalNote: 'African wealth is often communal — land, businesses, and assets passed through lineage.' },
  { id: 'LF04', station: 1, category: 'LEGACY_FUTURE', answerType: 'MCQ_EXPLAIN', question: 'What kind of legacy do you want to leave?', choices: ['Wealth and property', 'A strong family name', 'Community impact / philanthropy', 'Spiritual/cultural preservation'] },
  { id: 'LF05', station: 1, category: 'LEGACY_FUTURE', answerType: 'TEXT', question: 'Do you plan to build or buy land in your village? Is there ancestral land you will inherit?', culturalNote: 'Land inheritance customs vary dramatically across Africa — first sons, all sons, daughters, or communal.' },
  { id: 'LF06', station: 1, category: 'LEGACY_FUTURE', answerType: 'MCQ', question: 'Should we write a will together to protect our family?', choices: ['Yes — immediately after marriage', 'After our first child', 'When we accumulate significant assets', 'Traditional inheritance is enough'] },
  { id: 'LF07', station: 1, category: 'LEGACY_FUTURE', answerType: 'SCALE', question: 'How important is it that our children speak our mother tongue fluently?', scaleLabels: ['English/French is enough', 'They must speak our language'] },
  { id: 'LF08', station: 1, category: 'LEGACY_FUTURE', answerType: 'MCQ', question: 'Would you want our family to be involved in community leadership (chiefs, elders, associations)?', choices: ['Yes — we should lead', 'Support from behind', 'Only if asked', 'No — keep private life'] },
]

// ═══════════════════════════════════════════════════════════════════
// STATION 2 — TRUTH (80 questions)
// Harder questions · Deeper disclosure · 5 categories × 16
// ═══════════════════════════════════════════════════════════════════

const STATION_2: LoveQuestion[] = [
  // ── CHILDREN & PARENTING (16) ──
  { id: 'CH01', station: 2, category: 'CHILDREN_PARENTING', answerType: 'MCQ_EXPLAIN', question: 'How many children do you want? Is there a number that is non-negotiable?', choices: ['1-2', '3-4', '5 or more', 'None — I prefer a child-free marriage'], culturalNote: 'In many African families, large families are celebrated. But both partners must genuinely agree.' },
  { id: 'CH02', station: 2, category: 'CHILDREN_PARENTING', answerType: 'MCQ', question: 'If we cannot conceive naturally, what would you want to do?', choices: ['Medical intervention (IVF, etc.)', 'Adopt a child', 'Accept it as God\'s will', 'Explore surrogacy'] },
  { id: 'CH03', station: 2, category: 'CHILDREN_PARENTING', answerType: 'TEXT', question: 'Would you adopt a child? What about a child from within the extended family?', culturalNote: 'Informal adoption through extended family is deeply African — a cousin\'s child raised as your own.' },
  { id: 'CH04', station: 2, category: 'CHILDREN_PARENTING', answerType: 'MCQ', question: 'How should we discipline children?', choices: ['Firm but no physical punishment', 'Occasional spanking is okay', 'African discipline — rod of correction', 'Gentle parenting only'], culturalNote: 'Discipline approaches vary hugely and this is one of the biggest parenting conflicts.' },
  { id: 'CH05', station: 2, category: 'CHILDREN_PARENTING', answerType: 'SCALE', question: 'How involved should grandparents be in raising our children?', scaleLabels: ['Occasional visits only', 'They are co-parents'] },
  { id: 'CH06', station: 2, category: 'CHILDREN_PARENTING', answerType: 'MCQ_EXPLAIN', question: 'Should our children attend public, private, boarding, or international school?', choices: ['Best public school available', 'Private day school', 'Boarding school', 'International / homeschool'] },
  { id: 'CH07', station: 2, category: 'CHILDREN_PARENTING', answerType: 'TEXT', question: 'What naming ceremony traditions matter to you? Should we do traditional naming (e.g., Yoruba Isomoloruko, Igbo Iba Nwa)?', culturalNote: 'The naming ceremony is often the child\'s first cultural identity marker.' },
  { id: 'CH08', station: 2, category: 'CHILDREN_PARENTING', answerType: 'MCQ', question: 'If we have only daughters, how would you feel?', choices: ['Perfectly happy', 'Would try once more for a son', 'Disappointed but accepting', 'It matters deeply to me'], culturalNote: 'Preference for male children persists in some African lineages. Honest discussion prevents silent pain.' },
  { id: 'CH09', station: 2, category: 'CHILDREN_PARENTING', answerType: 'MCQ', question: 'Should we circumcise our sons? At what age?', choices: ['Yes — as infants (medical)', 'Yes — at traditional age', 'No — let them choose', 'Depends on medical advice'], culturalNote: 'Male circumcision has medical, cultural, and religious dimensions across Africa.' },
  { id: 'CH10', station: 2, category: 'CHILDREN_PARENTING', answerType: 'SCALE', question: 'How strict should we be with screen time and social media for our children?', scaleLabels: ['Very relaxed', 'Extremely strict'] },
  { id: 'CH11', station: 2, category: 'CHILDREN_PARENTING', answerType: 'TEXT', question: 'What cultural rites of passage do you want your children to go through?', culturalNote: 'Maasai warrior ceremonies, Yoruba age-grade initiations, Zulu reed dances — these shape identity.' },
  { id: 'CH12', station: 2, category: 'CHILDREN_PARENTING', answerType: 'MCQ', question: 'Should children do house chores? From what age?', choices: ['From 3-4 — simple tasks', 'From 6-7 — real responsibilities', 'Only when teenagers', 'We have help for that'] },
  { id: 'CH13', station: 2, category: 'CHILDREN_PARENTING', answerType: 'MCQ_EXPLAIN', question: 'If our child wants to marry someone from a different race or religion, how do we respond?', choices: ['Full support — love is love', 'Support but have a conversation', 'We\'d struggle with it', 'Absolutely not'] },
  { id: 'CH14', station: 2, category: 'CHILDREN_PARENTING', answerType: 'TEXT', question: 'How do you plan to teach children about sex, consent, and relationships?', explanation: 'Many African families avoid this. How will you break or continue that pattern?' },
  { id: 'CH15', station: 2, category: 'CHILDREN_PARENTING', answerType: 'MCQ', question: 'Should we save for our children\'s university education even at the cost of our own comfort?', choices: ['Yes — education is everything', 'Save what we can, they can also work', 'They should earn scholarships', 'Education is overrated'] },
  { id: 'CH16', station: 2, category: 'CHILDREN_PARENTING', answerType: 'SCALE', question: 'How much should we expose children to our African culture vs global/Western culture?', scaleLabels: ['Full global exposure', 'Deep African immersion'] },

  // ── MONEY & ASSETS (16) ──
  { id: 'MA01', station: 2, category: 'MONEY_ASSETS', answerType: 'MCQ_EXPLAIN', question: 'Should we have joint bank accounts, separate, or both?', choices: ['100% joint — everything shared', 'Joint for bills, separate for personal', 'Mostly separate with joint savings', 'Completely separate'], culturalNote: 'Financial transparency is the #1 marriage stabilizer across all African cultures.' },
  { id: 'MA02', station: 2, category: 'MONEY_ASSETS', answerType: 'TEXT', question: 'Do you have any debts right now? Student loans, business loans, family debts? Be completely honest.', explanation: 'Hidden debt destroys marriages. Full disclosure now prevents disaster later.' },
  { id: 'MA03', station: 2, category: 'MONEY_ASSETS', answerType: 'MCQ', question: 'Who should manage the household budget?', choices: ['Whoever earns more', 'We manage together monthly', 'The wife — she is the CFO', 'The husband — he is the head'] },
  { id: 'MA04', station: 2, category: 'MONEY_ASSETS', answerType: 'SCALE', question: 'How much of our income should go to extended family support?', scaleLabels: ['0% — we come first', '30% or more for family'] },
  { id: 'MA05', station: 2, category: 'MONEY_ASSETS', answerType: 'MCQ', question: 'Should I know your phone/email/bank passwords?', choices: ['Yes — full transparency', 'Bank only for emergencies', 'No — privacy matters', 'We share financial, keep personal private'] },
  { id: 'MA06', station: 2, category: 'MONEY_ASSETS', answerType: 'TEXT', question: 'What is your financial situation honestly? Savings, investments, salary range?', explanation: 'This is the hardest question in African dating. Dishonesty here is a red flag.' },
  { id: 'MA07', station: 2, category: 'MONEY_ASSETS', answerType: 'MCQ_EXPLAIN', question: 'If your partner earns significantly more than you, how would you feel?', choices: ['Proud and supportive', 'Slightly uncomfortable but managing', 'It would bother me deeply', 'I expect to be the higher earner'] },
  { id: 'MA08', station: 2, category: 'MONEY_ASSETS', answerType: 'MCQ', question: 'Should we invest in property back in Africa even if we live abroad?', choices: ['Yes — land is generational wealth', 'Only if we plan to return', 'Better to invest where we are', 'No — too risky'], culturalNote: 'Buying land "back home" is an African diaspora rite of passage.' },
  { id: 'MA09', station: 2, category: 'MONEY_ASSETS', answerType: 'SCALE', question: 'How financially generous should we be to friends and community?', scaleLabels: ['Charity begins at home only', 'Give freely, God replenishes'] },
  { id: 'MA10', station: 2, category: 'MONEY_ASSETS', answerType: 'MCQ', question: 'How do you feel about prenuptial agreements?', choices: ['Essential — protects both', 'Good idea but not romantic', 'Shows distrust', 'Against my cultural values'] },
  { id: 'MA11', station: 2, category: 'MONEY_ASSETS', answerType: 'TEXT', question: 'What is the most money you have ever lost, lent, or been scammed of? What did you learn?', explanation: 'Financial failures reveal risk tolerance and learning patterns.' },
  { id: 'MA12', station: 2, category: 'MONEY_ASSETS', answerType: 'MCQ', question: 'Should we join a cooperative savings group (ajo/esusu/stokvel/chama)?', choices: ['Yes — African savings culture', 'Only with trusted friends', 'I prefer banks only', 'Too risky'] },
  { id: 'MA13', station: 2, category: 'MONEY_ASSETS', answerType: 'MCQ_EXPLAIN', question: 'If one partner wants to quit their job to start a business, how do we decide?', choices: ['Support immediately — follow your dreams', 'Only with 12 months savings', 'Side hustle first, then transition', 'Too risky — keep the salary'] },
  { id: 'MA14', station: 2, category: 'MONEY_ASSETS', answerType: 'SCALE', question: 'How important are material things (luxury cars, designer fashion, expensive lifestyle)?', scaleLabels: ['Couldn\'t care less', 'Very important to me'] },
  { id: 'MA15', station: 2, category: 'MONEY_ASSETS', answerType: 'TEXT', question: 'How do you feel about your partner spending money on hobbies, travel, or self-care without asking?', explanation: 'Personal spending freedom vs financial accountability — where is the line?' },
  { id: 'MA16', station: 2, category: 'MONEY_ASSETS', answerType: 'MCQ', question: 'What happens to marital property if we divorce?', choices: ['50/50 no matter what', 'Based on who contributed more', 'Whoever has the children gets more', 'I don\'t plan for divorce'] },

  // ── CONFLICT & DISCIPLINE (16) ──
  { id: 'CD01', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ', question: 'When we argue, what is your conflict style?', choices: ['I need space — cool off first', 'Let\'s talk it through immediately', 'I go silent until it passes', 'I get loud and passionate'] },
  { id: 'CD02', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ_EXPLAIN', question: 'Should marital problems ever be discussed with friends, family, or elders?', choices: ['Never — what happens at home stays at home', 'Only with trusted elders', 'A counselor/therapist is fine', 'My mother always knows everything'], culturalNote: 'The African instinct is to involve elders. But oversharing destroys marriages too.' },
  { id: 'CD03', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'SCALE', question: 'How quickly should we resolve arguments — same day or can it take time?', scaleLabels: ['Take all the time needed', 'Never go to bed angry'] },
  { id: 'CD04', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'TEXT', question: 'What is the worst fight you have ever had in a relationship? How did it end?', explanation: 'Past conflict patterns predict future ones. Reflection shows growth.' },
  { id: 'CD05', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ', question: 'Is it ever acceptable to raise your voice during an argument?', choices: ['No — always calm and composed', 'Passion is natural, within limits', 'Sometimes you have to be heard', 'Shouting means the argument is serious'] },
  { id: 'CD06', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ', question: 'Who gets the "final say" in major family decisions?', choices: ['We must both agree — consensus', 'The husband — he is the head', 'Whoever has more expertise', 'We alternate based on the topic'] },
  { id: 'CD07', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'TEXT', question: 'Have you ever been physically aggressive in a relationship? Be completely honest.', explanation: 'This is a safety question. Zero tolerance for violence must be established.' },
  { id: 'CD08', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ_EXPLAIN', question: 'If we reach a deadlock, should we involve a marriage counselor?', choices: ['Yes — professional help is wise', 'Only as a last resort', 'Counsel from church/mosque is better', 'Family elders should mediate'] },
  { id: 'CD09', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'SCALE', question: 'How good are you at apologizing when you are wrong?', scaleLabels: ['I struggle with it', 'I apologize quickly and sincerely'] },
  { id: 'CD10', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ', question: 'Is it okay to walk out of the house during a heated argument?', choices: ['Yes — space is healthy', 'Only if you say where you\'re going', 'No — stay and resolve it', 'Depends on the severity'] },
  { id: 'CD11', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'TEXT', question: 'What triggers you the most emotionally? What buttons should I never push?', explanation: 'Knowing each other\'s emotional landmines prevents unnecessary detonations.' },
  { id: 'CD12', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ', question: 'How do you feel about your partner maintaining friendships with exes?', choices: ['Completely fine — mature adults', 'Only if I know about it', 'I\'d be uncomfortable', 'Absolutely not'] },
  { id: 'CD13', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ_EXPLAIN', question: 'If your family and your spouse clash, who do you side with?', choices: ['Always my spouse — we are one', 'Depends on who is right', 'My family by default', 'I try to stay neutral'] },
  { id: 'CD14', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'SCALE', question: 'How important is it that we never go to bed angry?', scaleLabels: ['Not important — sleep on it', 'Non-negotiable rule'] },
  { id: 'CD15', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'TEXT', question: 'What would you do if you discovered your partner was hiding something from you?', explanation: 'Deception response reveals trust baseline and confrontation style.' },
  { id: 'CD16', station: 2, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ', question: 'If we argue in front of children, should we also reconcile in front of them?', choices: ['Yes — model healthy resolution', 'Never argue in front of children', 'Reconcile privately — they forget', 'Arguments are learning opportunities'] },

  // ── INTIMACY & BOUNDARIES (16) ──
  { id: 'IB01', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'SCALE', question: 'How important is physical intimacy in a marriage to you?', scaleLabels: ['Not very important', 'Absolutely central'] },
  { id: 'IB02', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'MCQ_EXPLAIN', question: 'Are you comfortable discussing intimate desires and boundaries openly with your partner?', choices: ['Yes — open communication', 'Getting there, need patience', 'I find it embarrassing', 'Actions speak louder than words'] },
  { id: 'IB03', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'TEXT', question: 'What does emotional intimacy look like to you? How are you loved best?', explanation: 'Love languages in African context — does love look like provision, presence, words, or touch?' },
  { id: 'IB04', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'MCQ', question: 'How do you feel about your partner having close friends of the opposite gender?', choices: ['Completely fine — trust matters', 'Fine with boundaries', 'Uncomfortable but won\'t forbid it', 'Not acceptable'] },
  { id: 'IB05', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'SCALE', question: 'How much personal space and alone time do you need in a marriage?', scaleLabels: ['I want to do everything together', 'I need significant alone time'] },
  { id: 'IB06', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'MCQ', question: 'Should married couples have separate phones with full privacy?', choices: ['Yes — privacy is a right', 'Open phones, nothing to hide', 'Privacy with accountability', 'Shared family device'] },
  { id: 'IB07', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'TEXT', question: 'Have you been hurt in a past relationship in a way that affects how you trust or love now?', explanation: 'Trauma history shapes attachment style. Vulnerability here builds deep trust.' },
  { id: 'IB08', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'MCQ_EXPLAIN', question: 'What is your view on couple social media — posting about your relationship online?', choices: ['Post freely — celebrate our love', 'Occasional romantic posts', 'Keep our relationship private', 'Social media is toxic for marriages'] },
  { id: 'IB09', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'SCALE', question: 'How much public affection (holding hands, kissing) are you comfortable with?', scaleLabels: ['No PDA at all', 'Very affectionate in public'], culturalNote: 'PDA norms vary widely — Lagos vs Nairobi vs Accra vs the village.' },
  { id: 'IB10', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'MCQ', question: 'Should we schedule regular date nights even after years of marriage?', choices: ['Weekly without fail', 'Monthly is enough', 'When we feel like it', 'We don\'t need scheduled romance'] },
  { id: 'IB11', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'TEXT', question: 'What is the most romantic thing anyone has ever done for you? What made it special?', explanation: 'This reveals the partner\'s love language and romantic expectations.' },
  { id: 'IB12', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'MCQ', question: 'How would you handle a period of no physical intimacy in marriage (illness, distance, etc.)?', choices: ['Patience and understanding', 'Seek counseling', 'It would be very difficult', 'It could threaten the marriage'] },
  { id: 'IB13', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'MCQ_EXPLAIN', question: 'What are your views on polygamy or having multiple partners?', choices: ['Completely against it', 'Culturally acceptable but not for me', 'Open to it under certain conditions', 'I believe in it'], culturalNote: 'Polygamy is legally recognized in many African countries. Honest discussion prevents hidden expectations.' },
  { id: 'IB14', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'SCALE', question: 'How jealous do you naturally tend to be?', scaleLabels: ['Not jealous at all', 'Very possessive'] },
  { id: 'IB15', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'TEXT', question: 'What boundaries do you have that are absolute — things you will never compromise on?', explanation: 'Hard limits must be shared and respected from the beginning.' },
  { id: 'IB16', station: 2, category: 'INTIMACY_BOUNDARIES', answerType: 'MCQ', question: 'If intimacy fades, what should we do first?', choices: ['Have an honest conversation', 'See a therapist/counselor', 'Try to rekindle on our own', 'Accept it as normal'] },

  // ── CRISIS HANDLING (16) ──
  { id: 'CR01', station: 2, category: 'CRISIS_HANDLING', answerType: 'MCQ_EXPLAIN', question: 'If one of us loses their job, how do we handle it?', choices: ['Full support — take your time', 'You have 3 months, then any job', 'Immediately start hustling', 'Cut lifestyle drastically'] },
  { id: 'CR02', station: 2, category: 'CRISIS_HANDLING', answerType: 'TEXT', question: 'Tell me about the hardest thing you have ever gone through. How did you cope?', explanation: 'Resilience patterns during crisis reveal character more than anything else.' },
  { id: 'CR03', station: 2, category: 'CRISIS_HANDLING', answerType: 'MCQ', question: 'How do you handle mental health challenges? Would you seek therapy?', choices: ['Yes — therapy is necessary', 'Prayer and spiritual counsel first', 'I deal with it myself', 'My partner should be my therapist'] },
  { id: 'CR04', station: 2, category: 'CRISIS_HANDLING', answerType: 'SCALE', question: 'How prepared are you for financial emergencies (3-6 months savings)?', scaleLabels: ['Not prepared at all', 'Very prepared — emergency fund ready'] },
  { id: 'CR05', station: 2, category: 'CRISIS_HANDLING', answerType: 'MCQ', question: 'If your partner is diagnosed with a chronic illness, what do you do?', choices: ['Stand by them no matter what', 'Support but set boundaries for my own health', 'It depends on the illness', 'I would struggle deeply'] },
  { id: 'CR06', station: 2, category: 'CRISIS_HANDLING', answerType: 'TEXT', question: 'Have you ever faced ethnic, racial, or religious discrimination? How do we prepare our family for that?', culturalNote: 'African couples in diaspora and interethnic couples must prepare children for identity challenges.' },
  { id: 'CR07', station: 2, category: 'CRISIS_HANDLING', answerType: 'MCQ_EXPLAIN', question: 'If a natural disaster or war hits our region, what is our family escape plan?', choices: ['Relocate to family abroad', 'Return to ancestral home', 'Stay and rebuild', 'We need to plan this now'] },
  { id: 'CR08', station: 2, category: 'CRISIS_HANDLING', answerType: 'MCQ', question: 'If your partner struggles with addiction, how do you respond?', choices: ['Rehabilitation and support', 'Ultimatum — get clean or I leave', 'Involve the family', 'Pray and fast for deliverance'] },
  { id: 'CR09', station: 2, category: 'CRISIS_HANDLING', answerType: 'SCALE', question: 'How much do you worry about the future?', scaleLabels: ['Live day by day', 'I overthink and plan obsessively'] },
  { id: 'CR10', station: 2, category: 'CRISIS_HANDLING', answerType: 'TEXT', question: 'What is the biggest risk you have ever taken? Would you do it again?', explanation: 'Risk tolerance affects business decisions, relocation, career changes — everything.' },
  { id: 'CR11', station: 2, category: 'CRISIS_HANDLING', answerType: 'MCQ', question: 'If we are struggling financially, should we accept money from parents?', choices: ['Yes — no shame in family help', 'Only as a loan we repay', 'No — we figure it out ourselves', 'My pride wouldn\'t allow it'] },
  { id: 'CR12', station: 2, category: 'CRISIS_HANDLING', answerType: 'MCQ_EXPLAIN', question: 'How do you feel about life insurance?', choices: ['Essential — getting it immediately', 'Good idea, will get eventually', 'God is my insurance', 'Never thought about it'] },
  { id: 'CR13', station: 2, category: 'CRISIS_HANDLING', answerType: 'TEXT', question: 'If I died tomorrow, what would happen to our family? Are you prepared?', explanation: 'Death planning is taboo in many African cultures but critically important.' },
  { id: 'CR14', station: 2, category: 'CRISIS_HANDLING', answerType: 'MCQ', question: 'If one of our parents becomes seriously ill and needs daily care, what do we do?', choices: ['Move them into our home', 'Hire a caregiver', 'One of us moves closer to them', 'Share care with other siblings'], culturalNote: 'Elder care is not outsourced in African culture — but it can strain a young marriage.' },
  { id: 'CR15', station: 2, category: 'CRISIS_HANDLING', answerType: 'SCALE', question: 'How emotionally available are you during stressful times?', scaleLabels: ['I withdraw completely', 'I lean in and communicate more'] },
  { id: 'CR16', station: 2, category: 'CRISIS_HANDLING', answerType: 'MCQ', question: 'If political instability affected your country, would you consider leaving Africa permanently?', choices: ['Yes — safety first', 'Only temporarily', 'No — this is home forever', 'Depends on the threat level'] },
]

// ═══════════════════════════════════════════════════════════════════
// STATION 3 — COMMITMENT (80 questions)
// Hardest / most vulnerable · All 10 categories × 8
// ═══════════════════════════════════════════════════════════════════

const STATION_3: LoveQuestion[] = [
  // ── IDENTITY & VALUES (8) ──
  { id: 'IV09', station: 3, category: 'IDENTITY_VALUES', answerType: 'TEXT', question: 'What secret or shame from your past do you need me to know before we commit forever?', explanation: 'Full disclosure at this stage. Anything hidden will surface later as betrayal.' },
  { id: 'IV10', station: 3, category: 'IDENTITY_VALUES', answerType: 'MCQ_EXPLAIN', question: 'If we marry, do you see yourself primarily as African or as a citizen of the world?', choices: ['African first, always', 'Global citizen with African roots', 'It depends on context', 'I don\'t define myself by origin'] },
  { id: 'IV11', station: 3, category: 'IDENTITY_VALUES', answerType: 'TEXT', question: 'What would make you truly disappointed in yourself as a spouse? What standard do you hold yourself to?', explanation: 'Self-imposed standards reveal accountability and maturity.' },
  { id: 'IV12', station: 3, category: 'IDENTITY_VALUES', answerType: 'SCALE', question: 'How willing are you to completely change your life plans for this marriage?', scaleLabels: ['My path is set', 'I would change everything for us'] },
  { id: 'IV13', station: 3, category: 'IDENTITY_VALUES', answerType: 'MCQ', question: 'What matters most to you in life — above everything else?', choices: ['My relationship with God', 'My family and children', 'My career and purpose', 'My personal freedom and growth'] },
  { id: 'IV14', station: 3, category: 'IDENTITY_VALUES', answerType: 'TEXT', question: 'Write a promise to your future spouse. What do you vow to be for them?', explanation: 'This is your personal covenant — raw, unscripted, and real.' },
  { id: 'IV15', station: 3, category: 'IDENTITY_VALUES', answerType: 'MCQ_EXPLAIN', question: 'Do you believe marriage should be "forever" with no possibility of divorce?', choices: ['Yes — till death do us part', 'Ideally, but with realistic exceptions', 'Divorce should be available but last resort', 'People change — marriage can end'] },
  { id: 'IV16', station: 3, category: 'IDENTITY_VALUES', answerType: 'TEXT', question: 'What version of yourself are you becoming? How will you be different in 10 years?', explanation: 'Growth trajectory matters. Are they evolving or stagnating?' },

  // ── FAMILY & IN-LAWS (8) ──
  { id: 'FI09', station: 3, category: 'FAMILY_INLAWS', answerType: 'TEXT', question: 'Has your family ever been involved in a major conflict (inheritance, betrayal, feud)? How did it affect you?', explanation: 'Family trauma shapes relational patterns. Understanding heals.' },
  { id: 'FI10', station: 3, category: 'FAMILY_INLAWS', answerType: 'MCQ_EXPLAIN', question: 'If my parent insults you or treats you poorly, what do you expect me to do?', choices: ['Confront them immediately', 'Address it privately later', 'You fight your own battles', 'I would leave the marriage over it'], culturalNote: 'In-law conflicts end more African marriages than affairs. This must be settled now.' },
  { id: 'FI11', station: 3, category: 'FAMILY_INLAWS', answerType: 'SCALE', question: 'How willing are you to relocate to be closer to my family?', scaleLabels: ['Not willing at all', 'I\'d go anywhere for family'] },
  { id: 'FI12', station: 3, category: 'FAMILY_INLAWS', answerType: 'TEXT', question: 'Be honest: what worries you most about my family?', explanation: 'This requires vulnerability. Addressing fears now prevents resentment later.' },
  { id: 'FI13', station: 3, category: 'FAMILY_INLAWS', answerType: 'MCQ', question: 'When my parent dies, what burial/funeral customs should we follow?', choices: ['Full traditional rites — no shortcuts', 'Simple, dignified ceremony', 'Whatever the family decides', 'I haven\'t thought about death customs'], culturalNote: 'Funeral expenses in Africa can bankrupt families. Planning prevents crisis.' },
  { id: 'FI14', station: 3, category: 'FAMILY_INLAWS', answerType: 'MCQ_EXPLAIN', question: 'If your family disapproves of our marriage, will you still marry me?', choices: ['Yes — I choose us', 'I will fight for their approval first', 'I cannot go against my family', 'We would need to compromise'] },
  { id: 'FI15', station: 3, category: 'FAMILY_INLAWS', answerType: 'TEXT', question: 'What family role are you (peacemaker, provider, rebel, caretaker)? How does that affect our marriage?', explanation: 'Birth order and family roles carry into marriage dynamics.' },
  { id: 'FI16', station: 3, category: 'FAMILY_INLAWS', answerType: 'SCALE', question: 'How important is it that our children know and love YOUR parents deeply?', scaleLabels: ['Occasional contact is fine', 'As close as their own parents'] },

  // ── CHILDREN & PARENTING (8) ──
  { id: 'CH17', station: 3, category: 'CHILDREN_PARENTING', answerType: 'TEXT', question: 'What kind of parent are you afraid you might become? What habits do you need to break?', explanation: 'Self-awareness about parenting fears reveals depth and honesty.' },
  { id: 'CH18', station: 3, category: 'CHILDREN_PARENTING', answerType: 'MCQ_EXPLAIN', question: 'If our child comes out as LGBTQ, how do we respond?', choices: ['Love and accept fully', 'Love the child, address my discomfort quietly', 'It goes against my beliefs — I would struggle', 'I would not accept it'], culturalNote: 'This is deeply controversial in many African communities. Honesty here prevents a family rupture later.' },
  { id: 'CH19', station: 3, category: 'CHILDREN_PARENTING', answerType: 'SCALE', question: 'How much are you willing to sacrifice your career for your children?', scaleLabels: ['Career comes first', 'Children come before everything'] },
  { id: 'CH20', station: 3, category: 'CHILDREN_PARENTING', answerType: 'TEXT', question: 'What mistake did your parents make in raising you that you are determined not to repeat?', explanation: 'Generational healing starts with awareness. This is where it begins.' },
  { id: 'CH21', station: 3, category: 'CHILDREN_PARENTING', answerType: 'MCQ', question: 'Should our children primarily grow up in Africa or abroad?', choices: ['Africa — roots matter', 'Abroad — better opportunities', 'Split time between both', 'Let circumstances decide'] },
  { id: 'CH22', station: 3, category: 'CHILDREN_PARENTING', answerType: 'TEXT', question: 'How would you handle discovering our child is being bullied or is bullying others?', explanation: 'Parenting responses reveal conflict resolution transfer to the next generation.' },
  { id: 'CH23', station: 3, category: 'CHILDREN_PARENTING', answerType: 'MCQ', question: 'If we are struggling, should we stay together "for the children"?', choices: ['Yes — children need both parents', 'Only if we can be peaceful', 'No — unhappy parents harm children more', 'Seek counseling first before deciding'] },
  { id: 'CH24', station: 3, category: 'CHILDREN_PARENTING', answerType: 'TEXT', question: 'Write a letter to your future child. What do you want them to know about why you chose their other parent?', explanation: 'This is the ultimate commitment question. It crystallizes why this union matters.' },

  // ── MONEY & ASSETS (8) ──
  { id: 'MA17', station: 3, category: 'MONEY_ASSETS', answerType: 'TEXT', question: 'What is the most financially irresponsible thing you have ever done? How did it affect you?', explanation: 'Radical financial honesty. Patterns of recklessness must be addressed.' },
  { id: 'MA18', station: 3, category: 'MONEY_ASSETS', answerType: 'MCQ_EXPLAIN', question: 'If you suddenly inherited 100 million Naira (or $100K), what would you do with it?', choices: ['Invest in property and business', 'Save most, treat ourselves to something', 'Help family first, then save', 'Live our best life immediately'], explanation: 'Financial priorities under abundance reveal true values.' },
  { id: 'MA19', station: 3, category: 'MONEY_ASSETS', answerType: 'SCALE', question: 'How comfortable are you with your partner knowing your exact net worth right now?', scaleLabels: ['Very uncomfortable', 'Completely open'] },
  { id: 'MA20', station: 3, category: 'MONEY_ASSETS', answerType: 'TEXT', question: 'If I start earning much more or much less than you, how would our dynamic change?', explanation: 'Power dynamics shift with income. Addressing this prevents ego-based conflict.' },
  { id: 'MA21', station: 3, category: 'MONEY_ASSETS', answerType: 'MCQ', question: 'Should we financially plan for the possibility of divorce?', choices: ['Yes — wisdom, not pessimism', 'Only through life insurance', 'No — planning for it invites it', 'Each keeps their own records just in case'] },
  { id: 'MA22', station: 3, category: 'MONEY_ASSETS', answerType: 'TEXT', question: 'What would you do if you discovered your partner was secretly sending money to their family without telling you?', explanation: 'Financial secrecy in marriage — the African epidemic. How do you respond?' },
  { id: 'MA23', station: 3, category: 'MONEY_ASSETS', answerType: 'MCQ', question: 'At what point should our children start learning about money?', choices: ['Give pocket money from age 5', 'Open a savings account at 10', 'When they can earn their own', 'Money lessons start at the dinner table'] },
  { id: 'MA24', station: 3, category: 'MONEY_ASSETS', answerType: 'SCALE', question: 'Would you be comfortable if your spouse was the sole breadwinner permanently?', scaleLabels: ['Would hate it', 'Completely fine with it'] },

  // ── CONFLICT & DISCIPLINE (8) ──
  { id: 'CD17', station: 3, category: 'CONFLICT_DISCIPLINE', answerType: 'TEXT', question: 'If you discovered your partner was unfaithful, what would you do? Be brutally honest.', explanation: 'Infidelity response reveals forgiveness capacity, self-worth, and dealbreaker clarity.' },
  { id: 'CD18', station: 3, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ_EXPLAIN', question: 'Is there anything that would make you end the marriage immediately — no second chances?', choices: ['Physical violence', 'Infidelity', 'Financial fraud/hidden debt', 'Nothing — I would fight for my marriage always'], culturalNote: 'Dealbreakers must be explicit. Ambiguity breeds suffering.' },
  { id: 'CD19', station: 3, category: 'CONFLICT_DISCIPLINE', answerType: 'SCALE', question: 'How forgiving are you in general? Can you truly let go after being deeply hurt?', scaleLabels: ['I hold grudges', 'I forgive completely'] },
  { id: 'CD20', station: 3, category: 'CONFLICT_DISCIPLINE', answerType: 'TEXT', question: 'What is the hardest thing you have ever had to forgive? Did you truly let it go?', explanation: 'Forgiveness capacity predicts marital longevity more than compatibility scores.' },
  { id: 'CD21', station: 3, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ', question: 'If we are in public and you feel disrespected by me, what do you do?', choices: ['Address it calmly right there', 'Wait until we are alone', 'Walk away from the situation', 'Match the energy publicly'] },
  { id: 'CD22', station: 3, category: 'CONFLICT_DISCIPLINE', answerType: 'TEXT', question: 'What do you need to hear to feel truly safe in this relationship?', explanation: 'Security language is different for everyone. This answer is your partner\'s blueprint.' },
  { id: 'CD23', station: 3, category: 'CONFLICT_DISCIPLINE', answerType: 'MCQ', question: 'Is couple therapy a sign of weakness or wisdom?', choices: ['Wisdom — everyone should go', 'Good for people in crisis', 'Only if traditional counsel fails', 'Weakness — we should handle our own'] },
  { id: 'CD24', station: 3, category: 'CONFLICT_DISCIPLINE', answerType: 'TEXT', question: 'After our worst argument ever, what gesture or word from me would heal things?', explanation: 'This tells your partner exactly how to come back to you after a storm.' },

  // ── RELIGION & SPIRITUALITY (8) ──
  { id: 'RS09', station: 3, category: 'RELIGION_SPIRITUALITY', answerType: 'TEXT', question: 'If your faith changes significantly after marriage (deconversion, conversion, radicalization), how should I respond?', explanation: 'Spiritual evolution happens. This is about religious freedom within marriage.' },
  { id: 'RS10', station: 3, category: 'RELIGION_SPIRITUALITY', answerType: 'MCQ_EXPLAIN', question: 'Should our home have a prayer/meditation space, altar, or spiritual corner?', choices: ['Yes — prayer closet is essential', 'A small dedicated space', 'We pray anywhere — no special space', 'I\'m not spiritual enough for that'] },
  { id: 'RS11', station: 3, category: 'RELIGION_SPIRITUALITY', answerType: 'SCALE', question: 'How would you feel if your partner consulted a babalawo, sangoma, or traditional healer without telling you?', scaleLabels: ['Completely fine', 'I would feel betrayed'], culturalNote: 'Secret spiritual consultations are common across Africa. Transparency prevents suspicion.' },
  { id: 'RS12', station: 3, category: 'RELIGION_SPIRITUALITY', answerType: 'TEXT', question: 'What is your most honest doubt or struggle with faith? Can you share it with me?', explanation: 'Spiritual vulnerability is the deepest form of intimacy.' },
  { id: 'RS13', station: 3, category: 'RELIGION_SPIRITUALITY', answerType: 'MCQ', question: 'How do you feel about fasting as a couple for spiritual growth?', choices: ['We should fast together regularly', 'Individual fasting is fine', 'Only during religious seasons', 'I don\'t practice fasting'] },
  { id: 'RS14', station: 3, category: 'RELIGION_SPIRITUALITY', answerType: 'MCQ_EXPLAIN', question: 'If a prophet, pastor, or imam gives advice that contradicts what I believe is best for our family, who wins?', choices: ['The religious leader', 'We discuss and decide together', 'I follow my own conviction', 'Depends on the issue'] },
  { id: 'RS15', station: 3, category: 'RELIGION_SPIRITUALITY', answerType: 'TEXT', question: 'What prayer or blessing do you want spoken over our marriage? Write it in your own words.', explanation: 'Writing a blessing reveals spiritual depth and marital intention.' },
  { id: 'RS16', station: 3, category: 'RELIGION_SPIRITUALITY', answerType: 'SCALE', question: 'How important is it that our spiritual growth happens together, not separately?', scaleLabels: ['Individual paths are fine', 'We must grow together spiritually'] },

  // ── INTIMACY & BOUNDARIES (8) ──
  { id: 'IB17', station: 3, category: 'INTIMACY_BOUNDARIES', answerType: 'TEXT', question: 'What is your deepest fear about sexual intimacy in marriage? What do you need me to know?', explanation: 'Trauma, inexperience, expectations — this is the space for total honesty.' },
  { id: 'IB18', station: 3, category: 'INTIMACY_BOUNDARIES', answerType: 'MCQ_EXPLAIN', question: 'What would you do if you stopped being physically attracted to your partner?', choices: ['Work on it together — attraction can be rebuilt', 'Seek therapy', 'Accept it — commitment matters more than attraction', 'It would be a serious crisis'] },
  { id: 'IB19', station: 3, category: 'INTIMACY_BOUNDARIES', answerType: 'SCALE', question: 'How important is verbal affirmation ("I love you", compliments) in your daily life?', scaleLabels: ['Actions matter more', 'I need to hear it constantly'] },
  { id: 'IB20', station: 3, category: 'INTIMACY_BOUNDARIES', answerType: 'TEXT', question: 'What does betrayal mean to you? Is emotional cheating as bad as physical?', explanation: 'Definitions of faithfulness vary. Align your boundaries now.' },
  { id: 'IB21', station: 3, category: 'INTIMACY_BOUNDARIES', answerType: 'MCQ', question: 'How often should a married couple be intimate?', choices: ['Daily is ideal', 'Several times a week', 'When both feel like it', 'Quality over quantity'] },
  { id: 'IB22', station: 3, category: 'INTIMACY_BOUNDARIES', answerType: 'TEXT', question: 'What does submission mean to you in a marriage context? Is it one-sided or mutual?', culturalNote: 'The concept of submission is heavily debated across African denominations and cultures. Define it for yourselves.' },
  { id: 'IB23', station: 3, category: 'INTIMACY_BOUNDARIES', answerType: 'MCQ', question: 'Should we discuss our intimate life with anyone (therapist, close friend, elder)?', choices: ['Only a professional therapist', 'A very trusted same-gender friend', 'Never — it stays between us', 'Our religious counselor'] },
  { id: 'IB24', station: 3, category: 'INTIMACY_BOUNDARIES', answerType: 'TEXT', question: 'What would make you feel the most loved, safe, and desired in our marriage? Describe it.', explanation: 'This is the master key question. The answer is a roadmap to their heart.' },

  // ── LIFESTYLE & ROLES (8) ──
  { id: 'LR09', station: 3, category: 'LIFESTYLE_ROLES', answerType: 'MCQ_EXPLAIN', question: 'If your career demands you travel constantly (weeks away), is that acceptable?', choices: ['Yes — career must thrive', 'Maximum 1 week at a time', 'I\'d change careers to be home', 'We\'d need to renegotiate'], explanation: 'Long-distance within marriage is increasingly common but devastating if unplanned.' },
  { id: 'LR10', station: 3, category: 'LIFESTYLE_ROLES', answerType: 'TEXT', question: 'What habit or lifestyle choice of yours might be hardest for a partner to accept?', explanation: 'Pre-disclosure of difficult habits. Snoring, late nights, spending, messiness — all fair game.' },
  { id: 'LR11', station: 3, category: 'LIFESTYLE_ROLES', answerType: 'SCALE', question: 'How important is maintaining your personal friendships after marriage?', scaleLabels: ['Marriage replaces friendships', 'Friends are lifelines forever'] },
  { id: 'LR12', station: 3, category: 'LIFESTYLE_ROLES', answerType: 'MCQ', question: 'What does the "head of the household" concept mean to you?', choices: ['The man leads, wife submits', 'Shared leadership — co-CEOs', 'Whoever is strongest in each area leads', 'The concept is outdated'], culturalNote: 'Household headship is perhaps the most debated topic in African marriages. Clarity prevents power struggles.' },
  { id: 'LR13', station: 3, category: 'LIFESTYLE_ROLES', answerType: 'TEXT', question: 'If your partner wanted to make a major career change (doctor to artist, banker to farmer), how would you react?', explanation: 'Career flexibility reveals control tendencies and support capacity.' },
  { id: 'LR14', station: 3, category: 'LIFESTYLE_ROLES', answerType: 'MCQ', question: 'How should we handle household decisions about where to live?', choices: ['Follow the best career opportunity', 'Negotiate and compromise', 'Stay near family', 'Whoever feels most strongly decides'] },
  { id: 'LR15', station: 3, category: 'LIFESTYLE_ROLES', answerType: 'TEXT', question: 'What are you currently doing to become a better partner? What are you actively working on?', explanation: 'Personal development commitment reveals readiness for marriage.' },
  { id: 'LR16', station: 3, category: 'LIFESTYLE_ROLES', answerType: 'MCQ_EXPLAIN', question: 'After 20 years of marriage, what keeps the love alive?', choices: ['Continued dating and romance', 'Shared goals and purpose', 'Physical intimacy', 'Friendship above everything'] },

  // ── CRISIS HANDLING (8) ──
  { id: 'CR17', station: 3, category: 'CRISIS_HANDLING', answerType: 'TEXT', question: 'If you found out your partner had been lying about something major for years, could you stay?', explanation: 'Trust recovery question — reveals dealbreaker hierarchy.' },
  { id: 'CR18', station: 3, category: 'CRISIS_HANDLING', answerType: 'MCQ_EXPLAIN', question: 'If our child had a life-threatening illness and we couldn\'t afford treatment, what lengths would you go to?', choices: ['Sell everything we own', 'Borrow from anyone, anything', 'Trust God and do what we can', 'GoFundMe and community support'], culturalNote: 'Healthcare crisis is the #1 financial emergency in Africa. Preparation is love.' },
  { id: 'CR19', station: 3, category: 'CRISIS_HANDLING', answerType: 'SCALE', question: 'How emotionally strong do you consider yourself on your worst day?', scaleLabels: ['I fall apart', 'Unbreakable'] },
  { id: 'CR20', station: 3, category: 'CRISIS_HANDLING', answerType: 'TEXT', question: 'What is the one thing that could break you completely? What is your emotional Achilles heel?', explanation: 'Radical vulnerability. Sharing your deepest weakness builds the deepest trust.' },
  { id: 'CR21', station: 3, category: 'CRISIS_HANDLING', answerType: 'MCQ', question: 'If our marriage reaches a breaking point, will you fight for it or walk away?', choices: ['Fight until there is nothing left to fight for', 'Fight hard but know when to stop', 'Try counseling then reassess', 'If it\'s broken, it\'s broken'] },
  { id: 'CR22', station: 3, category: 'CRISIS_HANDLING', answerType: 'TEXT', question: 'What does your support system look like outside of me? Who do you call when things fall apart?', explanation: 'A partner who has no support system puts all emotional weight on the marriage.' },
  { id: 'CR23', station: 3, category: 'CRISIS_HANDLING', answerType: 'MCQ', question: 'How do you want me to handle you during your darkest moments?', choices: ['Hold me and be present', 'Give me space and check in later', 'Pray with me or over me', 'Distract me — make me laugh'] },
  { id: 'CR24', station: 3, category: 'CRISIS_HANDLING', answerType: 'TEXT', question: 'Look me in the eye and answer: are you truly ready for marriage? Not ready for a wedding — ready for a MARRIAGE.', explanation: 'The final question. The most important one. Answer from your gut, not your hopeful heart.' },

  // ── LEGACY & FUTURE (8) ──
  { id: 'LF09', station: 3, category: 'LEGACY_FUTURE', answerType: 'TEXT', question: 'What story do you want our grandchildren to tell about how we loved each other?', explanation: 'Multi-generational thinking. The love story becomes family legend.' },
  { id: 'LF10', station: 3, category: 'LEGACY_FUTURE', answerType: 'MCQ_EXPLAIN', question: 'Should we build a family business or keep careers separate?', choices: ['Build an empire together', 'Support each other\'s separate ventures', 'One works, one builds the family business', 'Too risky to mix business and marriage'] },
  { id: 'LF11', station: 3, category: 'LEGACY_FUTURE', answerType: 'SCALE', question: 'How important is it that we retire wealthy vs simply comfortable?', scaleLabels: ['Comfortable is enough', 'Wealthy is the goal'] },
  { id: 'LF12', station: 3, category: 'LEGACY_FUTURE', answerType: 'TEXT', question: 'What African proverb best describes the marriage you want to build? Why?', culturalNote: 'Proverbs carry generational wisdom. Your choice reveals your deepest marital philosophy.' },
  { id: 'LF13', station: 3, category: 'LEGACY_FUTURE', answerType: 'MCQ', question: 'Should we invest in our children\'s future or enjoy life now?', choices: ['Children first — sacrifice now', 'Balance both wisely', 'Live now — children will find their way', 'Invest in experiences together as a family'] },
  { id: 'LF14', station: 3, category: 'LEGACY_FUTURE', answerType: 'TEXT', question: 'If you could guarantee one thing for our family 50 years from now, what would it be?', explanation: 'The ultimate legacy question. Wealth? Unity? Faith? Impact? What matters most?' },
  { id: 'LF15', station: 3, category: 'LEGACY_FUTURE', answerType: 'MCQ', question: 'Should our family be known in our community (public facing) or live quietly?', choices: ['Known and influential', 'Respected but private', 'Quiet and peaceful', 'Public where it serves purpose'] },
  { id: 'LF16', station: 3, category: 'LEGACY_FUTURE', answerType: 'TEXT', question: 'Close your eyes. Picture our wedding day. Now picture our 50th anniversary. What changed and what stayed the same?', explanation: 'The final vision. This reveals whether they see marriage as a sprint or a lifetime marathon.' },
]

// ═══════════════════════════════════════════════════════════════════
// COMBINED EXPORT + HELPERS
// ═══════════════════════════════════════════════════════════════════

export const LOVE_QUESTIONS: LoveQuestion[] = [...STATION_1, ...STATION_2, ...STATION_3]

export function getStationQuestions(station: 1 | 2 | 3): LoveQuestion[] {
  return LOVE_QUESTIONS.filter(q => q.station === station)
}

export function getCategoryQuestions(category: QuestionCategory): LoveQuestion[] {
  return LOVE_QUESTIONS.filter(q => q.category === category)
}

export function getQuestion(id: string): LoveQuestion | undefined {
  return LOVE_QUESTIONS.find(q => q.id === id)
}

export function getStationCategoryQuestions(station: 1 | 2 | 3, category: QuestionCategory): LoveQuestion[] {
  return LOVE_QUESTIONS.filter(q => q.station === station && q.category === category)
}
