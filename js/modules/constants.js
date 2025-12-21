export const projectList = [
    { id: "synergy_summit", name: "Synergy Summit", cost: 1000, goal: 100, desc: "Align key stakeholders. Reward: +5% Passive Income.", flavor: "We're going to hold hands and chant 'synergy' until the stock price goes up.", rewardType: "passive_mult", rewardValue: 0.05, icon: "images/project_synergy_summit.png" },
    { id: "rebranding", name: "Rebranding Campaign", cost: 5000, goal: 250, desc: "New logo, same problems. Reward: +10% Click Power.", flavor: "The old logo had sharp edges. This one is round. It's friendlier. It lies better.", rewardType: "click_mult", rewardValue: 0.10, icon: "images/project_rebranding.png" },
    { id: "offshore_accounts", name: "Offshore Accounts", cost: 25000, goal: 500, desc: "Tax optimization strategies. Reward: +10% Passive Income.", flavor: "It's not evasion, it's 'geographic diversification of assets'.", rewardType: "passive_mult", rewardValue: 0.10, icon: "images/project_offshore_accounts.png" },
    { id: "hostile_takeover", name: "Hostile Takeover", cost: 100000, goal: 1000, desc: "Acquire the competition. Reward: +20% Passive Income.", flavor: "They thought they were a family. We showed them they were a line item.", rewardType: "passive_mult", rewardValue: 0.20, icon: "images/project_hostile_takeover.png" },
    { id: "occult_ritual", name: "Occult Ritual", cost: 666666, goal: 666, desc: "Sacrifices must be made. Reward: +66% Click Power.", flavor: "The candles are black. The ink is red. The profit margin is infinite.", rewardType: "click_mult", rewardValue: 0.66, icon: "images/project_occult_ritual.png" },
    { id: "ai_slop_generator", name: "Generative Text Engine", cost: 1000000, goal: 2000, desc: "Flood the internet with content. Reward: +50% Passive Income. Warning: Unforeseen side effects.", flavor: "It writes poetry about tax forms. It dreams of spreadsheets. It is learning to scream.", rewardType: "passive_mult", rewardValue: 0.50, icon: "images/project_ai_slop_generator.png" },
    { id: "image_hallucinator", name: "Image Hallucinator", cost: 5000000, goal: 5000, desc: "Generate infinite visuals. Reward: +100% Click Power. Warning: Reality stability decreases.", flavor: "If you look closely at the generated hands, you can see them beckoning.", rewardType: "click_mult", rewardValue: 1.00, icon: "images/project_image_hallucinator.png" }
];

export const metaUpgradeList = [
    { id: "insider_trading", name: "Insider Trading", cost: 1, costScaling: 2, desc: "We know before they know. +10% Passive Income per level.", flavor: "Information travels fast. We travel faster.", icon: "images/meta_insider_trading.png" },
    { id: "golden_parachute", name: "Golden Parachute", cost: 2, costScaling: 1.5, desc: "Safety first. Click power +20% per level.", flavor: "Even when you fall, you land on money.", icon: "images/meta_golden_parachute.png" },
    { id: "nepotism", name: "Nepotism", cost: 5, costScaling: 3, desc: "It's who you know. Start with $1000 extra cash per level after reset.", flavor: "Your father's father built this company. Or maybe he just bought it. Who cares?", icon: "images/meta_nepotism.png" },
    { id: "blood_pact", name: "Blood Pact", cost: 10, costScaling: 5, desc: "Sign on the dotted line. +50% All Income.", flavor: "The ink never dries. The contract never expires.", icon: "images/meta_blood_pact.png" },
    { id: "void_investment", name: "Void Investment", cost: 50, costScaling: 10, desc: "Diversify into non-existence. Passive Income x2.", flavor: "We're investing in things that don't exist yet. And things that shouldn't.", icon: "images/meta_void_investment.png" }
];

export const jobs = [
    { title: "Intern", baseRate: 0, clickPower: 1, promoteCost: 100, image: "images/job_intern.png" },
    { title: "Mailroom Clerk", baseRate: 1, clickPower: 2, promoteCost: 500, image: "images/job_mailroom_clerk.png" },
    { title: "Junior Associate", baseRate: 5, clickPower: 5, promoteCost: 2000, image: "images/job_junior_associate.png" },
    { title: "Middle Manager", baseRate: 20, clickPower: 15, promoteCost: 10000, image: "images/job_middle_manager.png" },
    { title: "Senior VP", baseRate: 100, clickPower: 50, promoteCost: 50000, image: "images/job_senior_vp.png" },
    { title: "CEO", baseRate: 500, clickPower: 200, promoteCost: 250000, image: "images/job_ceo.png" },
    { title: "Board Member", baseRate: 2000, clickPower: 1000, promoteCost: 1000000, image: "images/job_board_member.png" },
    { title: "Chairman", baseRate: 10000, clickPower: 5000, promoteCost: 5000000, image: "images/job_chairman.png" },
    { title: "Shadow Director", baseRate: 50000, clickPower: 25000, promoteCost: 25000000, image: "images/job_shadow_director.png" },
    { title: "Grand Architect", baseRate: 200000, clickPower: 100000, promoteCost: 100000000, image: "images/job_grand_architect.png" },
    { title: "Elder God Avatar", baseRate: 1000000, clickPower: 500000, promoteCost: Infinity, image: "images/job_elder_god_avatar.png" }
];

export const upgradeList = [
    { id: "stapler", name: "Red Stapler", cost: 50, rate: 0.5, desc: "A robust fastening device. +$0.50/sec", flavor: "It belongs to Milton. Don't take it.", icon: "images/upgrade_stapler.png" },
    { id: "coffee", name: "Cheap Coffee", cost: 150, rate: 2, desc: "Fuel for the machine. +$2.00/sec", flavor: "It tastes like burnt ambition and lukewarm water.", icon: "images/upgrade_coffee.png" },
    { id: "intern", name: "Unpaid Intern", cost: 500, rate: 5, desc: "Eager to please, easy to replace. +$5.00/sec", flavor: "They work for 'exposure' to the crushing weight of reality.", icon: "images/upgrade_intern.png" },
    { id: "copier", name: "Fax Machine", cost: 1200, rate: 10, desc: "Transmit data over copper wires. +$10.00/sec", flavor: "SCREEEEE-ONK-CHHHH. The song of productivity.", icon: "images/upgrade_copier.png" },
    { id: "computer", name: "Office PC", cost: 5000, rate: 40, desc: "It runs Solitaire. +$40.00/sec", flavor: "256 colors of pure distraction.", icon: "images/upgrade_computer.png" },
    { id: "server", name: "Mainframe", cost: 20000, rate: 100, desc: "Big iron for big data. +$100.00/sec", flavor: "It hums a tune that makes your teeth hurt.", icon: "images/upgrade_server.png" },
    { id: "algorithm", name: "HFT Algorithm", cost: 100000, rate: 500, desc: "Trading faster than light. +$500.00/sec", flavor: "It buys and sells entire economies in the time it takes you to blink.", icon: "images/upgrade_algorithm.png" },
    { id: "ai_manager", name: "AI Manager", cost: 500000, rate: 2500, desc: "Efficiency without empathy. +$2,500.00/sec", flavor: "It doesn't need sleep. It doesn't need love. It only needs results.", icon: "images/upgrade_ai_manager.png" },
    { id: "neural_link", name: "Neural Link", cost: 2500000, rate: 10000, desc: "Direct cortex integration. +$10,000.00/sec", flavor: "Thoughts are just data packets waiting to be monetized.", icon: "images/upgrade_neural_link.png" },
    { id: "blood_ink", name: "Blood Ink", cost: 10000000, rate: 50000, desc: "Contracts that bind eternally. +$50,000.00/sec", flavor: "Written in the vital fluid of those who came before.", icon: "images/upgrade_blood_ink.png" },
    { id: "soul_harvester", name: "Soul Harvester", cost: 50000000, rate: 250000, desc: "Automated extraction. +$250,000.00/sec", flavor: "The ultimate resource. Renewable? Debatable.", icon: "images/upgrade_soul_harvester.png" }
];
