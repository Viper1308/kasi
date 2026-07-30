/* ══════════════════════════════════════════════════════════════
   THE STRANDS — 78 pairs across 13 subjects.
   Written to be argued with, not admired.
   ══════════════════════════════════════════════════════════════ */
const CONNECTIONS = {

"economics|finance": {
brief: `Economics decides what the future is worth; finance sells claims on it. Every valuation model is a macro forecast in disguise — a DCF is just an opinion about growth and the discount rate with arithmetic stapled on. When the RBI moves the repo rate, it moves the risk-free leg of every equity valuation in the country within hours. The traffic runs the other way too: credit conditions are not a consequence of the business cycle, they largely <em>are</em> the business cycle, which is the point Minsky spent his career making and which 2008 proved expensively.`,
developments: [
`Modigliani–Miller (1958) proved capital structure is irrelevant in a frictionless world — the whole field since has been cataloguing which friction breaks it.`,
`Fama's efficient markets (1970) versus Shiller's excess volatility (1981): they shared the 2013 Nobel while still disagreeing, which tells you where the science stands.`,
`Indian household savings have shifted hard from gold and fixed deposits into equity — monthly SIP flows crossed ₹26,000 crore in 2025, giving domestic institutions the muscle to absorb foreign selling.`
],
relevance: [
`Minsky's financial instability hypothesis: stability itself breeds the leverage that ends stability. Ignored for decades, standard reading after 2008.`,
`The equity risk premium puzzle (Mehra–Prescott, 1985) is still unsolved. Stocks have historically returned far more than a sane risk model can justify.`
],
projects: [
`Rebuild a DCF for one Nifty 50 company three times, using RBI repo assumptions from 2019, 2022 and now. Report how much of "value" is really just rates.`,
`Test Shiller's CAPE on the Nifty since 1999 and check whether it predicts the next ten years of returns in India as weakly as it does in the US.`,
`Chart monthly SIP inflows against FII net flows since 2015 and see who is actually setting prices on down days.`,
`Reconstruct the IL&FS collapse (2018) as a Minsky sequence: hedge finance, speculative finance, Ponzi finance. Date each transition with real numbers.`,
`Build a simple credit-spread dashboard for Indian corporate bonds and test whether spreads lead GDP revisions or follow them.`
]
},

"economics|law": {
brief: `Law is the operating system economics runs on. Coase's insight was that if bargaining were free, it would not matter who held the legal right — the efficient outcome would be traded to anyway. Since bargaining is never free, the assignment of rights determines everything, and the discipline of law and economics is essentially the study of transaction costs. India makes this vivid: contract enforcement was so slow that debt was priced for non-recovery, until the IBC changed the default and repriced an entire credit market.`,
developments: [
`Coase, "The Problem of Social Cost" (1960) — the most-cited law review article ever written, and the founding text of the field.`,
`Posner's <em>Economic Analysis of Law</em> (1973) made efficiency the organising principle of common law reasoning, and drew fifty years of fire for it.`,
`India's Insolvency and Bankruptcy Code (2016) cut average resolution time from roughly four years to under two, and recovery rates jumped — the clearest natural experiment in institutional economics in recent Indian history.`
],
relevance: [
`Gary Becker treated crime as a rational choice under expected punishment (1968), which is why deterrence research now argues about certainty of capture rather than severity of sentence.`,
`Competition law is applied industrial organisation: the CCI's cases against cartels and platform self-preferencing are economic arguments litigated in legal language.`
],
projects: [
`Pick one CCI order and rewrite its reasoning as a formal economic argument — define the market, state the theory of harm, check whether the evidence supports it.`,
`Track IBC recovery rates and resolution timelines by year since 2017 and test whether the early gains have decayed.`,
`Model a real negotiation you have seen — a rental dispute, a society parking fight — as a Coasean bargain and identify precisely which transaction cost blocked the efficient outcome.`,
`Compare penalty structures for the same offence across the Motor Vehicles Act amendments and test Becker: did higher fines or more cameras change behaviour more?`,
`Write a short paper on whether specific performance or damages is the efficient default remedy in Indian contract law, using the 2018 amendment as your hinge.`
]
},

"economics|physics": {
brief: `Neoclassical economics did not borrow ideas from physics so much as borrow its <em>maths</em> — Fisher and Samuelson lifted the formalism of energy conservation and equilibrium mechanics wholesale, which is Mirowski's charge in <em>More Heat than Light</em>. The traffic later reversed. Physicists looking at financial data found fat tails, power laws and scaling behaviour that Gaussian finance had no room for, and econophysics was born. Bachelier modelled Brownian motion for the Paris Bourse in 1900, five years before Einstein used it for pollen.`,
developments: [
`Mandelbrot showed in 1963 that cotton price changes follow a power law, not a normal distribution. Finance ignored it for forty years and then rediscovered it in 2008.`,
`Mantegna and Stanley's <em>Introduction to Econophysics</em> (1999) formalised the field; the inverse-cubic law for return distributions is one of its most robust findings.`,
`Yakovenko's kinetic-exchange models derive Boltzmann-like wealth distributions from random trades, reproducing the Pareto tail without assuming any difference in ability.`
],
relevance: [
`Per Bak's self-organised criticality — the sandpile — is the cleanest available intuition for why market crashes have no proportionate cause.`,
`Black–Scholes is the heat equation with the variables renamed. Recognising that is worth more than memorising the formula.`
],
projects: [
`Pull ten years of Nifty daily returns and fit both a normal and a power-law tail. Compute how many "impossible" days actually occurred.`,
`Implement a kinetic-exchange money model with 10,000 agents and watch a Gini coefficient emerge from pure randomness.`,
`Derive Black–Scholes from the diffusion equation yourself, then write the derivation for someone who knows physics but not finance.`,
`Build a sandpile simulation and map its avalanche-size distribution against the size distribution of Nifty drawdowns.`,
`Read Mirowski's central chapter and write an honest verdict: is the physics-envy charge fair, or a rhetorical trick?`
]
},

"economics|math": {
brief: `Economics became mathematical in order to become falsifiable, and paid for it in realism. Arrow and Debreu proved in 1954 that a general competitive equilibrium exists — using Kakutani's fixed-point theorem, which had nothing to do with markets. That single move set the register for the next seventy years: an economic claim now means a theorem plus its assumptions, and most real arguments are fights about the assumptions. Optimisation, dynamic programming and measure-theoretic probability are the working tools.`,
developments: [
`Arrow–Debreu (1954) — existence of general equilibrium, proved by topology, not by any observation of a market.`,
`Bellman's dynamic programming (1957) gave economics its language for intertemporal choice, and gave reinforcement learning its foundation decades later.`,
`The credibility revolution moved the frontier from theorems to identification: instrumental variables, regression discontinuity, difference-in-differences — Card, Angrist and Imbens shared the 2021 Nobel for it.`
],
relevance: [
`Sonnenschein–Mantel–Debreu is the field's quiet embarrassment: aggregate demand curves can take almost any shape, so representative-agent macro rests on thin ice.`,
`Nash equilibrium exists because of a fixed-point theorem too. Game theory is applied topology wearing a suit.`
],
projects: [
`Prove the existence of a Nash equilibrium in a 2x2 game from Brouwer's theorem, writing every step out for a Class 12 audience.`,
`Solve a household consumption-savings problem by dynamic programming in Python and plot the policy function.`,
`Take one published Indian policy evaluation and redo its identification strategy. State precisely what would have to be true for the causal claim to hold.`,
`Build a Monte Carlo demonstration of the law of large numbers using cricket strike rates, showing how many balls before the average means anything.`,
`Write a note on why the Sonnenschein–Mantel–Debreu results are not taught in undergraduate courses.`
]
},

"economics|ai": {
brief: `Agrawal, Gans and Goldfarb's framing is the useful one: AI reduces the cost of prediction, and when the cost of an input collapses, everything complementary to it becomes more valuable and everything substitutable gets crushed. So the interesting economic question is not "will AI take jobs" but "which tasks within a job are prediction, and what happens to judgement once prediction is free." Running the other way, machine learning has quietly rebuilt applied econometrics: causal forests, double ML, synthetic controls at scale.`,
developments: [
`Susan Athey's causal forests brought heterogeneous treatment effect estimation into ML, letting you ask who a policy helps rather than whether it helps on average.`,
`Chernozhukov's double/debiased machine learning (2018) made it legitimate to use ML for nuisance parameters without wrecking your standard errors.`,
`Acemoglu and Restrepo's task-based framework distinguishes automation that displaces labour from automation that creates new tasks — the ratio decides whether wages rise or fall.`
],
relevance: [
`Algorithmic pricing can reach tacit collusion without any agreement, which competition law is not currently built to catch.`,
`The AI capex cycle is now large enough to move national accounts; scrutinise how much of recent US growth is data-centre construction.`
],
projects: [
`Take a job you know well — a school teacher's, a bank branch manager's — decompose it into tasks and classify each as prediction, judgement or physical.`,
`Run a causal forest on any public Indian survey dataset (NSSO, NFHS) and report who benefits most from an intervention.`,
`Simulate two Q-learning pricing agents in a duopoly and see how often they converge on supra-competitive prices without communicating.`,
`Build a nowcasting model for Indian inflation using high-frequency public data and benchmark it against RBI's own projections.`,
`Write a critique of one widely quoted "X% of jobs will be automated" study, checking its task classification against reality.`
]
},

"economics|cs": {
brief: `Market design is what happens when you ask a computer scientist to build a market that a mechanism designer specified. The result is engineering: kidney exchange chains, school choice systems, spectrum auctions worth billions. The two fields also collide over feasibility — Nash equilibria are PPAD-complete to compute, so an equilibrium that cannot be found in reasonable time is a strange thing to base a theory of markets on. India's UPI is the largest live demonstration that market plumbing is a public good.`,
developments: [
`Roth and Shapley's 2012 Nobel for matching markets: the deferred acceptance algorithm now runs medical residency matches and school admissions worldwide.`,
`Milgrom and Wilson's 2020 Nobel for auction theory, tested most publicly in spectrum auctions — including India's, where reserve price design has repeatedly caused failed rounds.`,
`Daskalakis, Goldberg and Papadimitriou showed computing Nash equilibrium is PPAD-complete (2006), a genuine limit on what equilibrium theory can promise.`
],
relevance: [
`The price of anarchy quantifies exactly how much efficiency selfish routing loses — the same maths covers traffic and internet packets.`,
`UPI processes billions of transactions a month at near-zero marginal cost, which reframes payments as infrastructure rather than a product.`
],
projects: [
`Implement Gale–Shapley and run it on a real allocation problem — CET counselling preferences, hostel rooms, internship matching.`,
`Simulate a second-price versus first-price auction with bidders who misjudge value, and measure who actually earns more revenue.`,
`Model Braess's paradox on a real Bengaluru road network and compute the price of anarchy.`,
`Build a toy order-matching engine with a limit order book, then test whether adding a 10ms batch auction reduces spoofing.`,
`Write up how UPI's interchange-free model shifted incentives for banks, and what the missing revenue means for its long-run funding.`
]
},

"economics|philosophy": {
brief: `Economics smuggles in a moral theory and then denies it has one. "Efficiency" means Pareto or Kaldor–Hicks, both of which are contestable ethical positions; cost-benefit analysis is utilitarianism with a spreadsheet. Sen's attack in "Rational Fools" is the sharpest version: a person whose every choice maximises their own utility is not rational, he is a social moron. His capability approach replaced "how much do people have" with "what are people actually able to do", which is why the HDI exists at all.`,
developments: [
`Sen, "Rational Fools" (1977), then <em>Development as Freedom</em> (1999) — the capability approach became the intellectual base of the Human Development Index.`,
`Rawls's difference principle (1971) gave redistribution a non-utilitarian justification; Nozick's <em>Anarchy, State, and Utopia</em> (1974) answered it within three years.`,
`Friedman's 1953 methodology essay argued assumptions need not be realistic if predictions hold — still the most consequential and most disputed paragraph in economic method.`
],
relevance: [
`Hume's is-ought gap is violated in most policy writing you will read this week. Learn to spot the jump.`,
`Behavioural economics did not just find bugs in rationality; it undermined the welfare criterion, because if preferences shift with framing, whose preferences are you maximising?`
],
projects: [
`Take one Union Budget measure and evaluate it three times — as a utilitarian, a Rawlsian, and a libertarian. Note where the rankings diverge.`,
`Write a defence of Friedman's "as if" methodology, then the strongest rebuttal, and say which you actually believe.`,
`Build a capability-based index for your own district using public data, and compare its ranking against per-capita income.`,
`Read Sen's "Rational Fools" and construct three real decisions of your own that his commitment concept explains better than utility maximisation.`,
`Argue whether discounting future lives in climate cost-benefit analysis is a technical choice or an ethical one.`
]
},

"economics|history": {
brief: `Cliometrics applied economic theory to the past and got shouted at for it — Fogel's counterfactual that American railroads were not indispensable, and his work on the profitability of slavery, showed how brutal quantitative history can be. North took the other route and argued institutions, not resources, explain who got rich. In India this is not academic: the drain debate begun by Dadabhai Naoroji in 1901 is still a live argument about how much colonial extraction cost, and what the counterfactual growth path would have been.`,
developments: [
`Fogel and North shared the 1993 Nobel for cliometrics and institutional economic history respectively.`,
`Acemoglu, Johnson and Robinson's "Colonial Origins" (2001) used settler mortality as an instrument for institutions; they won the 2024 Nobel for that line of work.`,
`Pomeranz's <em>The Great Divergence</em> (2000) argued Europe and the Yangtze delta were comparable until coal and colonies broke the tie — the standard counterweight to Eurocentric accounts.`
],
relevance: [
`Reinhart and Rogoff's <em>This Time Is Different</em> mapped eight centuries of financial crises, then had a spreadsheet error publicly exposed in 2013 — a lesson in both directions.`,
`Utsa Patnaik's drain estimates and their critics are worth reading together rather than separately.`
],
projects: [
`Reconstruct India's share of world GDP from Maddison's dataset and write what the numbers can and cannot support.`,
`Take the settler-mortality instrument and write the strongest available critique of it.`,
`Compare two princely states with different land revenue systems and test whether the difference shows up in literacy or agricultural yield today.`,
`Build a timeline of Indian famines against grain export data and evaluate Sen's entitlement thesis on the 1943 Bengal famine.`,
`Write a counterfactual essay: Indian industrialisation without the 1947 partition of Punjab and Bengal, kept honest about what you cannot know.`
]
},

"economics|politics": {
brief: `Public choice applies economic self-interest to politicians and bureaucrats, who had previously been assumed to be benevolent — Buchanan called it "politics without romance". The consequences are uncomfortable: concentrated benefits and dispersed costs mean a small group with a lot at stake beats a large group with a little at stake almost every time, which explains farm subsidies, tariffs and licence regimes better than any theory of the public good. India's fiscal federalism makes this observable: Finance Commission transfers are simultaneously a formula and a negotiation.`,
developments: [
`Buchanan and Tullock's <em>The Calculus of Consent</em> (1962) founded public choice; Buchanan took the 1986 Nobel.`,
`Political business cycles — Nordhaus (1975) — predict pre-election fiscal expansion; Indian state budgets in election years remain a good testing ground.`,
`The electoral bonds scheme, struck down by the Supreme Court in February 2024, produced the first public dataset linking corporate donations to parties in India.`
],
relevance: [
`Olson's <em>The Logic of Collective Action</em> explains why small organised groups dominate large diffuse ones — the single most useful political idea an economist has produced.`,
`The "freebies versus welfare" argument in Indian politics is mostly a definitional fight; the economics only starts once you fix a definition.`
],
projects: [
`Test the political business cycle: plot capital expenditure by Indian states against their election calendars for the last four cycles.`,
`Analyse the electoral bonds data for concentration — how much came from how few donors, and in which sectors.`,
`Model one Indian subsidy as concentrated benefit versus dispersed cost and estimate the per-household cost of the transfer.`,
`Compare the 14th and 15th Finance Commission devolution formulas and calculate which states gained and lost.`,
`Write a piece defining "freebie" precisely enough to be measurable, then classify twenty real schemes with it.`
]
},

"economics|logic": {
brief: `Rational choice theory is a logical system before it is an empirical claim. Revealed preference axioms are consistency conditions — if you choose A over B and B over C, choosing C over A makes you incoherent, not merely unusual. Arrow's impossibility theorem is a pure deduction: no voting rule can satisfy five modest conditions at once. The empirical failures matter precisely because the logic is airtight, so when behaviour violates the axioms, the axioms must be wrong about people.`,
developments: [
`Von Neumann and Morgenstern's expected utility axioms (1944) reduced rational choice under risk to four assumptions; Allais broke one of them with a questionnaire in 1953.`,
`Arrow's impossibility theorem (1951) — the founding result of social choice, proved on a single page.`,
`Afriat's theorem (1967) gives the exact condition (GARP) under which observed choices could have come from <em>any</em> utility function at all.`
],
relevance: [
`The Ellsberg paradox separates risk from ambiguity and breaks the Savage axioms, which is why ambiguity aversion is now its own field.`,
`Sen's Liberal Paradox shows Pareto efficiency and minimal personal rights are formally incompatible.`
],
projects: [
`Run a GARP test on your own spending for a month and find out whether you are a coherent agent.`,
`Prove Arrow's theorem yourself following Geanakoplos's three-proof paper, then explain one proof in plain language.`,
`Design and run the Allais questionnaire on twenty classmates and report the violation rate.`,
`Build a voting simulator that runs the same ballots through plurality, Borda, Condorcet and IRV, and show how often the winner changes.`,
`Write a short piece on whether Arrow's theorem is a genuine argument against democracy or a misread one.`
]
},

"economics|debate": {
brief: `Almost every policy motion is an economics motion in costume, and the same three moves win them: identify the incentive, name the counterfactual, and price the trade-off. Bastiat's seen-and-unseen is the most reusable rhetorical structure in existence — the visible benefit against the invisible cost. The failure mode is equally reliable: quoting an aggregate statistic without its denominator, or presenting a correlation as if the causal direction were obvious. Learning to demand the counterfactual is the single highest-return debating habit.`,
developments: [
`Bastiat's "That Which Is Seen, and That Which Is Not Seen" (1850) — the broken window fallacy, still deployed weekly in bad opinion columns.`,
`The credibility revolution changed what counts as evidence: an RCT or a clean natural experiment now outranks a regression, and good debaters know the difference.`,
`Reinhart–Rogoff's 90% debt threshold was cited in real austerity arguments before a graduate student found the spreadsheet error in 2013 — a case study in evidence laundering.`
],
relevance: [
`Opportunity cost is the argumentative weapon most under-used by school debaters: nothing is free, so what did the money not do?`,
`Beware elasticity claims made without a number. "Taxes will reduce consumption" is not an argument until you say by how much.`
],
projects: [
`Build a one-page evidence card for five recurring Indian policy motions — MSP, UBI, privatisation, GST slabs, fuel subsidy — each with real numbers and sources.`,
`Take a published op-ed and rewrite it, marking every seen benefit and every unseen cost.`,
`Prepare both sides of "This house would replace all subsidies with cash transfers" and record which side you find harder, and why.`,
`Assemble a list of ten commonly quoted economic statistics and check each against its primary source.`,
`Run a debate club session where the only permitted evidence is a causal identification strategy, and see what collapses.`
]
},

"economics|art": {
brief: `Art is the purest test of value theory, because there is no cash flow to fall back on — a painting is worth what the marginal bidder says. Baumol's cost disease started here: a string quartet needs the same four players it needed in 1800, so as productivity rises elsewhere, live performance gets relatively more expensive forever. That single mechanism explains rising costs in education and healthcare too. Rosen's superstar economics explains the other half: when distribution is cheap, tiny quality differences produce enormous income differences.`,
developments: [
`Baumol and Bowen's cost disease (1966), first observed in the performing arts, now the standard explanation for rising service-sector prices.`,
`Rosen's "Economics of Superstars" (1981) explains why the top 1% of musicians take most of the revenue — and predicted streaming economics twenty years early.`,
`The 2021 NFT boom and collapse ran the entire lifecycle of a speculative asset class in about eighteen months, with full public transaction data.`
],
relevance: [
`The Mei Moses index tracks repeat sales of artworks and consistently shows lower risk-adjusted returns than equities, plus severe survivorship bias.`,
`Veblen goods invert the demand curve: raising the price raises the quantity demanded, which is why luxury pricing looks irrational and is not.`
],
projects: [
`Analyse Indian auction house results over ten years and test whether art beat the Nifty after fees and illiquidity.`,
`Model cost disease with real data: compare ticket prices for live classical performance against consumer inflation since 2000.`,
`Pull public NFT transaction data and plot the full bubble, marking where volume decoupled from new entrants.`,
`Study Spotify's payout structure and calculate what a mid-tier Indian independent artist actually earns per thousand streams.`,
`Write a valuation framework for an asset with zero cash flow and defend it against the obvious objection.`
]
},

"finance|law": {
brief: `A security is a legal document that happens to have a price. Limited liability, the trust, the corporate form and the enforceable security interest are legal inventions without which capital markets simply do not exist — Hansmann and Kraakman call it asset partitioning, and it is arguably a bigger financial innovation than any derivative. Securities regulation is the state deciding what sellers must tell buyers, and every major disclosure regime in history was written immediately after a specific scandal.`,
developments: [
`The US Securities Acts of 1933 and 1934 built mandatory disclosure out of the 1929 crash; SEBI's 1992 statutory powers came directly out of the Harshad Mehta scam.`,
`SEBI's LODR regulations and later insider trading amendments have steadily widened what counts as unpublished price sensitive information — the Adani–Hindenburg episode from 2023 tested them publicly.`,
`The IBC (2016) rewrote creditor priority in India, and the Essar Steel judgment (2019) settled that the Committee of Creditors' commercial wisdom is largely beyond judicial review.`
],
relevance: [
`Contract law decides what a derivative actually is; ISDA master agreements are private legislation for a market larger than most economies.`,
`Related party transaction rules exist because promoter-controlled firms are the norm in India, not the exception — a very different problem from the dispersed-ownership one US law was built for.`
],
projects: [
`Read one SEBI adjudication order end to end and map the evidentiary chain from trading data to legal conclusion.`,
`Compare disclosure requirements for Indian IPOs against the actual post-listing performance of twenty recent issues.`,
`Trace one company through the IBC from admission to resolution and chart where each creditor class's money went.`,
`Draft a plain-language version of a real ISDA clause and note what precision you lose.`,
`Study three insider trading cases and identify what evidence actually convicted, versus what merely looked suspicious.`
]
},

"finance|physics": {
brief: `Options pricing is a heat equation. Bachelier wrote Brownian motion into finance in 1900; Black, Scholes and Merton closed the loop in 1973 by showing that a continuously rebalanced hedge eliminates risk, so the option must be priced at the cost of that hedge. Then physicists arrived properly, and the picture got worse for the models: volatility clusters, tails are fat, correlations spike exactly when diversification is needed. Emanuel Derman, a particle physicist turned quant, wrote the honest account of what transfers and what does not.`,
developments: [
`Black–Scholes–Merton (1973), the Nobel in 1997, and the collapse of LTCM in 1998 with Merton and Scholes on the board — the sequence is the whole lesson.`,
`The volatility smile appeared in market prices after 1987 and has never left: it is the market pricing in exactly the crash that the lognormal model says is impossible.`,
`Stochastic volatility and jump-diffusion models (Heston, Merton) exist because constant volatility is empirically false in every market ever studied.`
],
relevance: [
`Derman's <em>My Life as a Quant</em> and <em>Models.Behaving.Badly</em> are the two best books on what a model is allowed to claim.`,
`Random matrix theory can separate signal from noise in a correlation matrix — essential when you estimate 500 assets from 250 days of data.`
],
projects: [
`Implement Black–Scholes, then plot the implied volatility surface from live Nifty options and measure how far reality is from the assumption.`,
`Backtest a delta-hedging strategy on one Indian stock and compute the real hedging error over a quarter.`,
`Apply random matrix theory to a Nifty 200 correlation matrix and report how many eigenvalues survive the noise threshold.`,
`Simulate a jump-diffusion process and compare its tail behaviour against actual Nifty daily returns.`,
`Write a short essay on why LTCM's failure was a modelling failure rather than a mathematical one.`
]
},

"finance|math": {
brief: `Modern finance is applied stochastic calculus, and the pivotal object is the martingale — under the risk-neutral measure, a discounted asset price has no drift, which is why arbitrage-free pricing works at all. Harrison and Kreps turned that into the fundamental theorem of asset pricing in 1979. On the portfolio side, Markowitz reduced diversification to a quadratic optimisation, elegant and famously unstable: mean-variance optimisers amplify estimation error so aggressively that equal weighting often beats them out of sample.`,
developments: [
`Markowitz (1952) invented portfolio theory; DeMiguel, Garlappi and Uppal (2009) showed naive 1/N beats it out of sample across most datasets.`,
`Harrison–Kreps and Harrison–Pliska established the equivalence between no-arbitrage and the existence of a risk-neutral measure — the theoretical spine of derivatives pricing.`,
`Kelly criterion betting, from Shannon's information theory, is now standard in position sizing, though almost nobody bets full Kelly because the drawdowns are unbearable.`
],
relevance: [
`Ito's lemma is the one piece of maths that genuinely separates people who can price derivatives from people who cannot.`,
`Copulas were used to model mortgage correlation before 2008. The Li Gaussian copula is the most expensive misuse of a mathematical tool in history.`
],
projects: [
`Build a mean-variance optimiser for ten Indian stocks and demonstrate its instability by perturbing one expected return slightly.`,
`Test 1/N against optimised weights on Nifty constituents over rolling five-year windows.`,
`Simulate full, half and quarter Kelly on a positive-edge bet and plot the drawdown distributions.`,
`Derive Ito's lemma and use it to get the Black–Scholes PDE, writing it up for a strong Class 12 student.`,
`Read Salmon's "Recipe for Disaster" on the Gaussian copula and write what the mathematics actually assumed versus what users believed.`
]
},

"finance|ai": {
brief: `Markets are the hardest possible machine learning problem: the signal-to-noise ratio is brutal, the data-generating process changes when you trade on it, and any edge you find is being competed away as you find it. This is why finance ML is mostly a discipline of not fooling yourself — López de Prado's whole book is about backtest overfitting, leakage and the multiple-testing problem. The genuinely working applications are less glamorous: fraud detection, credit scoring on thin files, document extraction, execution optimisation.`,
developments: [
`Renaissance Technologies' Medallion fund is the existence proof that systematic edge is possible; the fact that it closed to outside money is the caveat.`,
`López de Prado's <em>Advances in Financial Machine Learning</em> (2018) made the deflated Sharpe ratio and purged cross-validation standard practice.`,
`India's account aggregator framework (live since 2021) put consented financial data flows on rails, which is what makes alternative-data credit scoring feasible here.`
],
relevance: [
`Any backtest without transaction costs, slippage and survivorship adjustment is a work of fiction.`,
`Model risk in credit scoring is now a fairness question — the RBI's digital lending guidelines respond directly to it.`
],
projects: [
`Build a trading strategy backtest, then deliberately break it: add costs, remove delisted-survivor bias, and report how much of the Sharpe survives.`,
`Implement purged k-fold cross-validation and show how ordinary k-fold leaks information in time series.`,
`Train a credit default model on a public lending dataset and audit its error rates across demographic slices.`,
`Use an LLM to extract structured data from twenty Indian annual reports and measure its accuracy against manual reading.`,
`Compute the deflated Sharpe ratio for a strategy you built and see how many trials it takes to make a fake edge look real.`
]
},

"finance|cs": {
brief: `Finance is a distributed systems problem with money attached. An exchange is a matching engine plus a message bus with a latency budget measured in microseconds, and market structure debates about co-location or speed bumps are really systems design debates. Blockchains attacked a narrower question — how to reach consensus about ownership without a trusted intermediary — and the honest scoreboard so far is that they solved a real computer science problem while mostly failing to displace incumbent financial plumbing, except where the incumbent was absent.`,
developments: [
`Nasdaq's move to fully electronic matching, and the 2010 Flash Crash, together defined the modern debate on automated market structure.`,
`IEX's 350-microsecond speed bump (2016) proved that latency is a design parameter regulators are willing to let exchanges tune.`,
`India's UPI and the account aggregator stack demonstrate a different model — public digital infrastructure rather than private rails or distributed ledgers.`
],
relevance: [
`FIX protocol is unglamorous and runs a large fraction of global order flow. Reading its spec teaches more than most fintech articles.`,
`Idempotency and exactly-once semantics in payments are where most real fintech bugs live.`
],
projects: [
`Write a limit order book matching engine in a language of your choice and stress test it with a million synthetic orders.`,
`Reconstruct the 2010 Flash Crash from public data and write the sequence as an incident post-mortem.`,
`Build a small double-entry ledger service with idempotent transfers and prove it cannot double-spend under retries.`,
`Compare UPI's architecture against a blockchain settlement design on latency, cost and failure modes — with numbers.`,
`Parse raw exchange data and rebuild the order book at a given timestamp to see how much information a snapshot loses.`
]
},

"finance|philosophy": {
brief: `Finance forces philosophical questions into practical form. Knight's distinction between risk (measurable) and uncertainty (not) decides whether a model is applicable at all, and most financial disasters come from treating the second as the first. Then there is the ethics: is a short seller a parasite or a truth-teller? Is high-frequency trading provision of liquidity or a tax on it? Keynes's beauty contest is the sharpest statement of the epistemic problem — you are not judging value, you are judging what others judge value to be.`,
developments: [
`Knight's <em>Risk, Uncertainty and Profit</em> (1921) — the distinction that Taleb rebuilt a career on eighty years later.`,
`Keynes's beauty contest (1936) anticipated reflexivity; Soros made the same point from a trading desk in <em>The Alchemy of Finance</em>.`,
`ESG investing collapsed as a coherent category once it tried to serve both ethics and returns simultaneously — the greenwashing enforcement actions from 2022 onward are the evidence.`
],
relevance: [
`Hindenburg's short reports on Adani raised the question directly: does a profit motive invalidate a true accusation?`,
`Islamic finance is a live laboratory for whether interest can be engineered out of a system or merely renamed.`
],
projects: [
`Write the strongest defence of short selling, then the strongest attack, and identify the single fact that would settle it.`,
`Classify ten real financial decisions as Knightian risk or uncertainty and justify each boundary call.`,
`Study one ESG fund's holdings against its stated mandate and report the gap.`,
`Analyse whether Islamic finance instruments differ economically from conventional ones, or only in structure.`,
`Write an essay on whether index funds, by not voting thoughtfully, have an ownership problem.`
]
},

"finance|history": {
brief: `Every bubble is embarrassingly similar and everybody involved believes theirs is different. Kindleberger's <em>Manias, Panics, and Crashes</em> maps the same five-stage arc from displacement to revulsion across four centuries, and it fits tulips, railways, dot-coms and crypto with unreasonable accuracy. Financial history is also institutional history: the Bank of England was created to fund a war, the Fed to stop bank runs, SEBI to stop Harshad Mehta. Nothing in market regulation was designed in advance.`,
developments: [
`Kindleberger's five-stage model (1978) remains the best available template; Minsky supplied its engine.`,
`The 1992 Harshad Mehta securities scam exposed the ready-forward deal loophole and directly produced SEBI's statutory powers and dematerialisation.`,
`Reinhart and Rogoff assembled eight centuries of crisis data to show sovereign default is a recurring feature, not an aberration.`
],
relevance: [
`Ketan Parekh in 2001, the 2008 global crisis, IL&FS in 2018 and the 2023 short-seller episode form a usable Indian sequence for studying leverage cycles.`,
`Bagehot's rule from 1873 — lend freely at a penalty rate against good collateral — is still the operating manual for central banks in a panic.`
],
projects: [
`Map three bubbles onto Kindleberger's five stages with dated evidence for each transition.`,
`Reconstruct the Harshad Mehta mechanism precisely and explain which specific control failure allowed it.`,
`Chart Indian bank credit growth against NPA recognition since 2005 and find the lag.`,
`Compare the 1997 Asian crisis and the 2013 taper tantrum in terms of India's external vulnerability metrics.`,
`Write a case study of a crisis that did <em>not</em> happen and identify what prevented it.`
]
},

"finance|politics": {
brief: `Central bank independence is a political settlement dressed as a technical arrangement — governments delegate rate-setting precisely because they cannot trust their own future selves before an election. In India the settlement is visible in its stress points: the inflation targeting framework adopted in 2016, the surplus transfer dispute of 2018-19, the resignation of a governor. Meanwhile capital flows are foreign policy by other means, and sanctions have turned the dollar payments system into an instrument of statecraft.`,
developments: [
`India adopted flexible inflation targeting in 2016 with a 4% target and a ±2% band, and a Monetary Policy Committee replacing sole gubernatorial discretion.`,
`The 2018 RBI–government conflict over Section 7 and the economic capital framework ended with a governor's resignation and the Jalan committee formula.`,
`Freezing Russian central bank reserves in 2022 changed how every non-aligned country thinks about reserve composition — the rise of rupee and yuan settlement follows from it.`
],
relevance: [
`Sovereign credit ratings are political products with quantitative packaging; India's investment-grade fight is partly a methodological argument.`,
`Financial repression — holding rates below inflation to erode public debt — is a tax that never appears in a budget document.`
],
projects: [
`Read four MPC minutes and track how dissents map onto members' backgrounds.`,
`Compare India's inflation targeting performance against its pre-2016 record, controlling for oil.`,
`Analyse the composition of RBI's foreign exchange reserves over the last decade and interpret the shifts geopolitically.`,
`Model the fiscal value of financial repression in India during the 1970s and 1980s.`,
`Write a brief on whether the MPC's external members have actually changed decisions, using voting records.`
]
},

"finance|logic": {
brief: `No-arbitrage is a logical constraint before it is an economic one: if two portfolios pay identically in every state, they must cost the same, or a contradiction is exploitable for cash. All of derivatives pricing is deduction from that single premise. Dutch book arguments do the same work for probability — hold incoherent beliefs and someone can construct a set of bets you are guaranteed to lose. This is the cleanest place in your syllabus where formal logic pays cash.`,
developments: [
`Ramsey (1926) and de Finetti (1937) developed Dutch book arguments, grounding subjective probability in the avoidance of guaranteed loss.`,
`The law of one price and put-call parity are pure deductive results that any trader can verify on a screen in seconds.`,
`Prediction markets operationalise coherence: Polymarket and Kalshi prices are constrained by the same no-arbitrage logic as options.`
],
relevance: [
`Most "market inefficiency" claims are actually claims about constraints on arbitrage — shorting costs, capital limits, career risk.`,
`Shleifer and Vishny's limits of arbitrage explains why an obvious mispricing can persist and still bankrupt anyone who bets against it.`
],
projects: [
`Verify put-call parity on live Nifty options across ten strikes and quantify the deviation against transaction costs.`,
`Construct a Dutch book against a set of deliberately incoherent probability estimates from a friend's predictions.`,
`Scan prediction market prices on related events for logical inconsistencies and calculate the implied arbitrage.`,
`Write the no-arbitrage argument for forward pricing as a formal proof with explicit premises.`,
`Document a real mispricing you can observe and list every constraint preventing you from exploiting it.`
]
},

"finance|debate": {
brief: `Financial debate motions are won on mechanism, not sentiment. "This house would ban high-frequency trading" is unwinnable on vibes and very winnable if you can explain what a market maker does, what the bid-ask spread costs a retail investor, and where the adverse selection sits. The other transferable skill is number hygiene: a percentage without a base, a return without a benchmark and a risk without a horizon are all rhetorically powerful and analytically empty.`,
developments: [
`The GameStop episode of January 2021 turned market structure — payment for order flow, short interest, clearing collateral — into a mainstream political argument overnight.`,
`Crypto regulation debates now hinge on a single question that most debaters skip: is the token a security under an existing test, or is it something new?`,
`India's 2018 to 2020 crypto banking ban and its reversal by the Supreme Court is a compact case study in proportionality reasoning.`
],
relevance: [
`Survivorship bias is the most common unforced error in finance arguments: comparing the winners of a strategy against the average of everything else.`,
`Any argument invoking "the market has spoken" needs the follow-up: which market, over what horizon, and with whose money?`
],
projects: [
`Build an evidence file on high-frequency trading with actual spread data before and after HFT entry in Indian markets.`,
`Prepare both sides of "This house would abolish payment for order flow" with mechanism-level detail.`,
`Take five financial claims from news headlines and rewrite each with its missing denominator.`,
`Debate whether retail investors should be permitted to trade F&O in India, using SEBI's own loss statistics.`,
`Run a session where every claim must survive a survivorship-bias challenge.`
]
},

"finance|art": {
brief: `Art became an asset class when someone worked out how to lend against it. Freeports in Geneva and Singapore hold billions in canvases that never move, because possession and provenance can be transferred without transport or tax. Fractional ownership platforms then tried to solve art's liquidity problem, and mostly demonstrated that illiquidity was doing useful work. Underneath everything sits the provenance question, which is really a question about documentary trust — the same problem blockchains claimed to solve and largely did not.`,
developments: [
`The Mei Moses repeat-sales index (2002) let art returns be measured properly, and showed them to be lower and riskier than the auction press releases imply.`,
`Beeple's 69 million dollar sale at Christie's in March 2021 legitimised digital art and simultaneously marked the top of the NFT market.`,
`Masterworks and similar platforms securitised individual paintings from 2017, creating a real dataset on what fractional art ownership actually returns.`
],
relevance: [
`Art lending against collateral is a live private-credit market, priced on illiquidity rather than cash flow.`,
`The Indian modern art market — Souza, Raza, Gaitonde — has its own price history worth studying separately from the Western one.`
],
projects: [
`Build a repeat-sales index for Indian modern art from public auction records.`,
`Compare a fractional art platform's advertised returns against its fee structure and compute the net to an investor.`,
`Investigate one famous provenance dispute and write what documentation would have prevented it.`,
`Model art as collateral: what haircut would you demand, and why?`,
`Analyse whether NFT prices tracked crypto liquidity rather than any artistic signal, using on-chain data.`
]
},

"law|physics": {
brief: `Physics enters law as evidence and as constraint. Forensic reconstruction — skid marks, blood spatter, bullet trajectory — is applied mechanics presented to people with no training in it, which is exactly why the US National Academy of Sciences report in 2009 found large parts of forensic science had never been validated. The other direction is regulatory: radiation limits, nuclear liability, spectrum allocation and now space debris are all areas where the physics sets hard boundaries that legislation has to work inside.`,
developments: [
`The NAS report <em>Strengthening Forensic Science</em> (2009) found bite-mark and hair comparison evidence scientifically unsupported, after decades of convictions relying on them.`,
`India's Civil Liability for Nuclear Damage Act (2010) broke international convention by allowing supplier liability, which is why foreign reactor deals stalled for a decade.`,
`The Outer Space Treaty forbids national appropriation of celestial bodies, but the US Space Act (2015) and similar laws permit resource extraction — a gap nobody has litigated yet.`
],
relevance: [
`The Daubert standard governs when scientific testimony is admissible in the US; Indian courts have no equivalent gatekeeping rule, which matters more than it sounds.`,
`Speed, braking distance and reaction time calculations decide motor accident claims constantly, usually with nobody in the room checking the arithmetic.`
],
projects: [
`Take a reported motor accident judgment and recompute the physics from the recorded evidence.`,
`Write a plain-language primer on the difference between class-level and individual-level forensic identification.`,
`Analyse India's nuclear liability act against the Convention on Supplementary Compensation and explain the commercial consequence.`,
`Draft a model liability regime for orbital debris that would work with existing treaty text.`,
`Study one wrongful conviction overturned on forensic grounds and trace exactly where the science failed.`
]
},

"law|math": {
brief: `Courts handle probability badly and the failures are named. The prosecutor's fallacy confuses the probability of the evidence given innocence with the probability of innocence given the evidence — the Sally Clark case put a mother in prison on that error, and the Royal Statistical Society had to publicly intervene. Beyond forensics, quantitative reasoning now sits inside apportionment law, electoral delimitation and reservation arithmetic, where the mathematics of proportionality does real constitutional work.`,
developments: [
`Sally Clark's conviction (1999) rested on a 1 in 73 million figure derived by illegitimately squaring probabilities; her acquittal in 2003 changed expert evidence rules in the UK.`,
`Bayesian reasoning about DNA match probabilities is now standard, but the presentation of likelihood ratios to juries remains contested.`,
`The Indian Supreme Court's 50% ceiling on reservations, and the arguments in Indra Sawhney and later cases, are essentially disputes about proportionality arithmetic.`
],
relevance: [
`The birthday paradox explains why database trawl matches are far less impressive than single-suspect matches.`,
`Gerrymandering has a mathematical literature — efficiency gap, Markov chain sampling of districting plans — that Indian delimitation debates have not yet used.`
],
projects: [
`Work through the Sally Clark statistics and write the correct calculation alongside the one presented in court.`,
`Explain likelihood ratios in DNA evidence for a jury-level audience without using the word Bayesian.`,
`Simulate districting plans for a state using a Markov chain and compare against the actual delimitation.`,
`Analyse the arithmetic of the 50% reservation ceiling across states with different population compositions.`,
`Find a reported judgment containing a statistical claim and audit it.`
]
},

"law|ai": {
brief: `Three separate fights are happening at once and they get confused. First, liability: when an autonomous system causes harm, who is the defendant? Second, copyright: is training on scraped text infringement, and is model output copyrightable at all? Third, due process: algorithmic decisions in bail, credit and welfare are unreviewable in practice even where they are reviewable in principle. India's DPDP Act 2023 addresses data, not decisions, which leaves the second and third fights entirely open here.`,
developments: [
`The EU AI Act, agreed in 2024, is the first comprehensive risk-tiered regime; its obligations for general purpose models phase in through 2025 and 2026.`,
`The New York Times sued OpenAI and Microsoft in December 2023; the outcome will define whether training constitutes fair use in the US.`,
`India's Digital Personal Data Protection Act (2023) passed with broad government exemptions and rules that took until 2025 to firm up.`
],
relevance: [
`The COMPAS recidivism controversy showed that competing fairness definitions can be mathematically incompatible — a legal standard cannot satisfy all of them.`,
`Indian courts have begun experimenting with AI translation and transcription, which raises evidentiary questions nobody has answered.`
],
projects: [
`Compare the EU AI Act's risk tiers against India's DPDP Act clause by clause and write what is missing.`,
`Build a mock liability framework for an autonomous vehicle accident under existing Indian tort principles.`,
`Read the NYT complaint and OpenAI's response and write a neutral summary of the strongest argument on each side.`,
`Demonstrate the impossibility result in algorithmic fairness with a small dataset and explain it legally.`,
`Draft a disclosure standard for AI use in judicial proceedings.`
]
},

"law|cs": {
brief: `Code is not law, despite Lessig's famous line being constantly misquoted — his actual point was that code <em>regulates</em>, so whoever writes it exercises quasi-legal power without any of the accountability. Smart contracts made this concrete and then embarrassing: the DAO hack of 2016 was code executing exactly as written, and the community reversed it anyway, proving that human consensus overrides the machine when enough money is involved. Meanwhile intermediary liability decides what the internet looks like in practice.`,
developments: [
`Lessig's <em>Code and Other Laws of Cyberspace</em> (1999) established that architecture is a regulatory modality alongside law, norms and markets.`,
`The DAO hack (June 2016) drained about 3.6 million ETH and forced an Ethereum hard fork, permanently settling the "code is law" argument in practice.`,
`India's IT Rules 2021 imposed traceability and compliance officer requirements on intermediaries; the constitutional challenges are still working through the courts.`
],
relevance: [
`Section 79 safe harbour, and the Shreya Singhal judgment (2015), are the two things you must know to argue anything about Indian platform regulation.`,
`Differential privacy gives a mathematical definition of what "anonymised" means, which most data protection law still lacks.`
],
projects: [
`Write a smart contract, then write the ordinary contract it replaces, and list every ambiguity the code cannot express.`,
`Analyse the IT Rules 2021 traceability requirement against the technical reality of end-to-end encryption.`,
`Build a differential privacy demonstration showing what re-identification is possible at different epsilon values.`,
`Study the DAO fork and write whether the reversal was legitimate governance or a bailout.`,
`Compare Section 79 with the US Section 230 and the EU DSA on who bears the cost of moderation.`
]
},

"law|philosophy": {
brief: `The core question is whether law is whatever the sovereign validly enacts, or whether an unjust law fails to be law at all. Hart argued the first from a rule of recognition; Fuller argued the second from an internal morality of law; their 1958 exchange in the Harvard Law Review is still the clearest statement of both. Dworkin then attacked Hart from a third direction, arguing that principles, not just rules, are part of law — which is precisely how the Indian Supreme Court reasons when it invokes the basic structure.`,
developments: [
`The Hart–Fuller debate (1958) over Nazi-era laws framed legal positivism against natural law for the next half century.`,
`Dworkin's <em>Law's Empire</em> (1986) proposed law as integrity, with judges finding the interpretation that best fits and justifies past practice.`,
`Kesavananda Bharati (1973) invented the basic structure doctrine — arguably the most consequential piece of judicial philosophy in Indian constitutional history.`
],
relevance: [
`Hohfeld's analysis of rights into claims, privileges, powers and immunities clarifies almost every muddled rights argument you will hear.`,
`Ambedkar's constitutional philosophy, especially on constitutional morality, is under-read relative to its influence.`
],
projects: [
`Read the Hart–Fuller exchange and write which position better handles a law you personally think is unjust.`,
`Analyse the basic structure doctrine as a Dworkinian move and assess whether it is judicial overreach.`,
`Apply Hohfeld's framework to disentangle a real rights dispute reported this month.`,
`Write on whether constitutional morality is a coherent standard or a judicial blank cheque.`,
`Compare Ambedkar's and Gandhi's positions on law as an instrument of social change.`
]
},

"law|history": {
brief: `Indian law is a colonial artefact still running. The IPC of 1860, the Evidence Act of 1872 and the CrPC were Macaulay's project, designed to govern a subject population, and they survived independence almost intact — the 2023 replacements (BNS, BNSS, BSA) renamed and reorganised more than they rewrote. Legal history matters because doctrines carry their origins: sedition law under Section 124A was used against Tilak and Gandhi before it was used against anyone else.`,
developments: [
`Macaulay's Indian Penal Code (drafted 1837, enacted 1860) was one of the first comprehensive criminal codes anywhere, and outlived the empire that wrote it.`,
`The Bharatiya Nyaya Sanhita replaced the IPC from July 2024, keeping much of the structure while adding new offences and dropping others.`,
`Section 124A sedition was kept in abeyance by the Supreme Court in May 2022, pending review — a rare suspension of a live criminal provision.`
],
relevance: [
`The Permanent Settlement of 1793 shaped land ownership and litigation patterns in eastern India that are still visible in court dockets.`,
`Comparing the 1950 Constitution's drafting debates against the Government of India Act 1935 shows how much was inherited rather than invented.`
],
projects: [
`Map twenty IPC sections onto their BNS equivalents and identify what substantively changed.`,
`Trace the sedition provision from 1870 through Tilak, Gandhi, Kedar Nath Singh and the 2022 suspension.`,
`Compare Constituent Assembly debates on a single article against the final text.`,
`Study how the Permanent Settlement affected litigation rates in Bengal versus ryotwari areas.`,
`Write on why post-colonial states so rarely rewrite inherited legal codes from scratch.`
]
},

"law|politics": {
brief: `Judicial review is the permanent argument about who has the last word, and India runs an unusually strong version of it. The basic structure doctrine means Parliament cannot amend certain features even with the numbers, which is either a guarantee against majoritarian overreach or an unelected veto, depending on your priors. The collegium system for judicial appointments — invented by the court itself, and defended by striking down the NJAC in 2015 — makes the tension unusually explicit here.`,
developments: [
`Kesavananda Bharati (1973) established basic structure; the Emergency (1975-77) then tested every part of it, with ADM Jabalpur as the judiciary's worst moment.`,
`The NJAC judgment (2015) struck down a constitutional amendment passed unanimously by Parliament, preserving the collegium.`,
`Electoral bonds were struck down in February 2024 on grounds of the voter's right to information, forcing disclosure of donor data.`
],
relevance: [
`The counter-majoritarian difficulty — Bickel's phrase — is the standard frame for arguing about judicial legitimacy.`,
`Anti-defection law under the Tenth Schedule has produced a genuinely strange politics of resignation and disqualification timing.`
],
projects: [
`Build a timeline of basic structure cases and identify how the list of protected features has grown.`,
`Analyse the NJAC judgment's reasoning and write the strongest case for parliamentary appointment power.`,
`Study Speaker decisions under the anti-defection law for timing patterns.`,
`Compare judicial appointment mechanisms across four democracies and score them on independence and accountability.`,
`Write on whether ADM Jabalpur was an aberration or a predictable institutional response to pressure.`
]
},

"law|logic": {
brief: `Legal reasoning is defeasible: conclusions hold unless a defeating condition applies, which is nothing like classical deduction where adding premises never removes a conclusion. This is why formal logic imported directly into law keeps failing. What does transfer is precision — burden of proof is a formal allocation, standards of proof are thresholds on a probability scale, and the classic fallacies of ambiguity and equivocation are the most common defects in real judgments.`,
developments: [
`Toulmin's argument model (1958) — claim, grounds, warrant, backing, qualifier, rebuttal — was developed specifically because legal reasoning does not fit syllogisms.`,
`Non-monotonic and defeasible logics developed in AI research from the 1980s turned out to be the best formal model of legal argument.`,
`Argumentation frameworks (Dung, 1995) let you compute which sets of arguments can coherently stand together, and are now used in legal AI systems.`
],
relevance: [
`Beyond reasonable doubt is deliberately not a number, and every attempt to assign one has been rejected by courts. Ask why.`,
`Statutory interpretation canons frequently contradict each other — Llewellyn's famous list of thrusts and parries.`
],
projects: [
`Map a real judgment onto Toulmin's model and find the unstated warrant.`,
`Implement a small Dung argumentation framework and run a real dispute through it.`,
`Collect ten pairs of contradictory interpretive canons and show a case where each pair was decisive.`,
`Write on whether standards of proof should be numerically specified, arguing both sides.`,
`Find a judgment containing an equivocation and rewrite the passage without it.`
]
},

"law|debate": {
brief: `Moots and debates are different games and confusing them costs you. A moot is bound by authority — you argue within precedent, and an assertion without a citation is worthless. A debate is bound by persuasion — you argue from principle, and a citation without a mechanism is worthless. What transfers both ways is structure: issue, rule, application, conclusion, delivered under time pressure while being interrupted. Cross-examination technique is the same skill in both rooms.`,
developments: [
`The Jessup and Vis moots set the international standard for structured legal argument under judicial questioning.`,
`Live-streaming of Indian Supreme Court constitution bench hearings from 2022 made high-level oral advocacy publicly watchable for the first time.`,
`Parliamentary debate formats now routinely run legal motions, which rewards competitors who can actually read a judgment.`
],
relevance: [
`Reading a judgment for its ratio rather than its rhetoric is a trainable skill and most people never train it.`,
`Judicial questioning teaches you that the strongest response to a hard question is to concede the narrow point and defend the wider one.`
],
projects: [
`Watch one constitution bench hearing and diagram every judicial question and the counsel's response.`,
`Write a moot memorial and a debate case on the same proposition, then list every difference.`,
`Build a case file on one contested legal motion with primary sources only.`,
`Run cross-examination drills on a partner using a real judgment as the source material.`,
`Extract the ratio from five judgments and compare against how news reports described them.`
]
},

"law|art": {
brief: `Copyright is the state granting a temporary monopoly on expression, justified as an incentive, and it has expanded far past anything an incentive argument supports — life plus sixty years in India, life plus seventy in much of the West. Two other bodies of law matter: moral rights, which in India under Section 57 let an author object to distortion even after selling the work, and cultural property law, which decides whether looted antiquities go home. Generative AI has now dropped a live grenade into all three.`,
developments: [
`Amar Nath Sehgal v Union of India (2005) enforced an artist's moral rights over a destroyed mural, an unusually strong Indian precedent.`,
`The US Copyright Office confirmed in 2023 that purely AI-generated images cannot be copyrighted, requiring human authorship.`,
`Repatriation of Indian antiquities accelerated through the 2010s and 2020s, mostly via bilateral negotiation rather than litigation.`
],
relevance: [
`Fair dealing in India is narrower than US fair use: it lists purposes rather than applying a general test, which changes what a critic or parodist may do.`,
`The droit de suite resale royalty exists in India under Section 53A but is barely enforced.`
],
projects: [
`Compare Indian fair dealing and US fair use on the same five hypothetical uses.`,
`Study the Sehgal case and write whether moral rights should survive a sale.`,
`Track one repatriated antiquity through its full provenance chain.`,
`Draft an argument for and against copyright for AI-assisted works with a defined human contribution threshold.`,
`Analyse whether artist resale royalties would help or hurt emerging Indian artists, with data.`
]
},

"math|physics": {
brief: `Wigner called it the unreasonable effectiveness of mathematics: structures invented for internal reasons keep turning out to describe the universe. Riemannian geometry existed for sixty years before general relativity needed it. Group theory was pure algebra before it became the classification scheme for particles. The relationship is not one-way — calculus was invented to do mechanics, and string theory has produced results that mathematicians could not have found alone, notably mirror symmetry.`,
developments: [
`Riemann's geometry (1854) was waiting when Einstein needed curved spacetime in 1915 — the canonical case of maths preceding physics.`,
`Noether's theorem (1918) tied every conservation law to a symmetry, which is the single deepest structural fact in physics.`,
`Mirror symmetry, arising from string theory in the 1990s, let physicists solve enumerative geometry problems that had defeated mathematicians.`
],
relevance: [
`Renormalisation was mathematically disreputable for decades while producing the most accurate predictions in science. Rigour and truth are not the same thing.`,
`Wigner's 1960 essay is short, and worth reading before you form an opinion on why maths works.`
],
projects: [
`Derive conservation of momentum from translational symmetry using Noether's theorem and write it up for a Class 12 reader.`,
`Work through the geodesic equation and explain what "straight line" means on a curved surface.`,
`Build a visualisation of a group's action on a physical system — rotations of a molecule, symmetries of a crystal.`,
`Read Wigner's essay and write a response arguing either selection bias or genuine mystery.`,
`Trace one mathematical structure from pure invention to physical application, dating each step.`
]
},

"ai|physics": {
brief: `Neural networks are function approximators, and physics is full of functions that are expensive to evaluate — so machine learning is eating computational physics from the middle out. AlphaFold is the loudest case, but lattice QCD, weather modelling, plasma control in tokamaks and gravitational wave detection are all now hybrid. The reverse direction is more interesting for you: statistical mechanics is currently the best available theory of why deep learning works at all, with energy landscapes, phase transitions and renormalisation appearing in the analysis.`,
developments: [
`Hopfield networks and Boltzmann machines came directly from spin glass physics; Hopfield and Hinton shared the 2024 Nobel in Physics for it.`,
`DeepMind's plasma control system held a tokamak configuration stable in 2022, a genuine physics result produced by reinforcement learning.`,
`Physics-informed neural networks embed differential equations into the loss function, so the model cannot violate conservation laws.`
],
relevance: [
`The lottery ticket hypothesis and the double descent curve are both phenomena that classical statistics did not predict and statistical physics partly explains.`,
`Gravitational wave detection at LIGO uses matched filtering, but ML classifiers now handle glitch rejection.`
],
projects: [
`Implement a Hopfield network and store patterns until it fails, then compute the capacity and compare with theory.`,
`Build a physics-informed neural network for the heat equation and compare it against a finite difference solver.`,
`Reproduce the double descent curve on a small dataset and write what it implies about overfitting.`,
`Train a classifier on simulated gravitational wave data with injected noise.`,
`Write an explainer on why spin glasses turned out to be a model of memory.`
]
},

"cs|physics": {
brief: `Landauer's principle says erasing one bit costs at least kT ln2 of energy — computation is physical, and that puts a thermodynamic floor under every data centre. Quantum computing takes the same relationship the other way: use quantum mechanics as the substrate and some problems get exponentially cheaper. Shor's algorithm factors integers in polynomial time, which is why post-quantum cryptography standards are being deployed now, well before a machine exists that could break RSA.`,
developments: [
`Shor's algorithm (1994) made quantum computing a security problem rather than a curiosity.`,
`NIST published its first post-quantum cryptography standards in August 2024 — ML-KEM, ML-DSA and SLH-DSA — starting a migration that will take a decade.`,
`Google's Willow chip result in December 2024 demonstrated error correction improving as qubits are added, the threshold behaviour the field had been waiting for.`
],
relevance: [
`Reversible computing sidesteps Landauer's limit in principle, and is why the field exists at all.`,
`"Harvest now, decrypt later" means encrypted data being stolen today may be readable in fifteen years — a live reason to migrate early.`
],
projects: [
`Implement Grover's algorithm on a simulator and verify the quadratic speedup empirically.`,
`Calculate the theoretical minimum energy for a real computation and compare against an actual chip's consumption.`,
`Benchmark a post-quantum key exchange against RSA and ECDH on handshake size and speed.`,
`Simulate a small error-correcting code and show how the logical error rate falls below the physical one.`,
`Write an explainer on why quantum computers will not speed up most everyday programs.`
]
},

"philosophy|physics": {
brief: `Physics keeps generating questions it cannot answer with physics. What is a measurement? Copenhagen says the wavefunction collapses and declines to say why; many-worlds says it never collapses and you pay for it with universes; pilot wave says particles have definite positions and you pay with non-locality. All three make identical predictions, so the choice is not empirical — which is itself a philosophical result about the limits of empiricism. Bell's theorem is the exception that turned metaphysics into an experiment.`,
developments: [
`Bell's theorem (1964) made local realism testable; Aspect, Clauser and Zeilinger shared the 2022 Nobel for closing the loopholes.`,
`The block universe interpretation of special relativity — the relativity of simultaneity implies no universal present — is the hardest available challenge to the reality of time's passage.`,
`Fine-tuning arguments and the multiverse response are now a serious methodological dispute about whether unobservable explanations count as physics.`
],
relevance: [
`Kuhn built <em>The Structure of Scientific Revolutions</em> largely on the history of physics, and the word paradigm has been abused ever since.`,
`Determinism in physics does not settle free will, but it constrains which answers remain available.`
],
projects: [
`Write the Bell inequality derivation and explain precisely what assumption experiment has ruled out.`,
`Compare three quantum interpretations on what each must accept as a cost, without picking a winner.`,
`Argue whether the block universe view is compatible with moral responsibility.`,
`Assess whether the multiverse is an explanation or an evasion, using Popper's criterion.`,
`Study one Kuhnian revolution in physics and test whether his model actually fits the historical record.`
]
},

"history|physics": {
brief: `The Manhattan Project is the moment physics stopped being an academic pursuit, and the historiography is unusually rich because so many participants wrote. It is also the cleanest available case study in scientific responsibility. Beyond the bomb, the history of physics is a history of instruments — Galileo's telescope, the cloud chamber, the cyclotron, LIGO — and the pattern is consistent: new instruments create new fields, theory follows.`,
developments: [
`The Trinity test (July 1945) and Hiroshima three weeks later; the Franck Report had argued for a demonstration first and was overruled.`,
`Homi Bhabha built India's nuclear programme from 1945 onward on a deliberately dual-use foundation, culminating in Pokhran in 1974.`,
`The Bohr–Einstein debates ran from 1927 to 1935 and produced the EPR paper, which was intended as a refutation and became a research programme.`
],
relevance: [
`Meghnad Saha's ionisation equation (1920) is the Indian physics result that changed astrophysics; his political career afterwards is less known and worth reading.`,
`The Soviet suppression of genetics under Lysenko, contrasted with the relative freedom of Soviet physics, shows what states will tolerate when weapons depend on it.`
],
projects: [
`Write a timeline of the Manhattan Project decision points and identify where a different choice was live.`,
`Study Bhabha's three-stage nuclear plan and assess how much of it was achieved.`,
`Trace the Saha equation from derivation to its effect on stellar spectroscopy.`,
`Compare the Franck Report against the Interim Committee's reasoning.`,
`Pick one instrument and write how it created a field that did not exist before it.`
]
},

"physics|politics": {
brief: `Nuclear weapons made physicists into political actors whether they wanted it or not, and the institutions built afterwards — the IAEA, the NPT, the test ban treaties — are physics constraints written as international law. India's position is the interesting one: outside the NPT on the grounds that it is discriminatory, yet granted a civil nuclear waiver in 2008. Climate policy is now the larger case, where a physical quantity, the carbon budget, has to be divided among sovereign states with no mechanism to enforce it.`,
developments: [
`The NPT (1970) split the world into recognised and unrecognised nuclear states; India has never signed and calls the framework discriminatory.`,
`The India–US civil nuclear agreement and the 2008 NSG waiver gave India access to nuclear trade without NPT membership.`,
`The IPCC's remaining carbon budget framing turned climate negotiation into an explicit allocation problem, which is where equity arguments now live.`
],
relevance: [
`Pugwash and the Russell–Einstein manifesto created a template for scientists organising politically that still operates.`,
`Research funding is industrial policy: where a state builds accelerators or fusion reactors reveals what it thinks the next century needs.`
],
projects: [
`Analyse India's no-first-use doctrine and its stated exceptions, and assess its credibility.`,
`Compute per-capita versus cumulative carbon budget allocations for five countries and compare the fairness claims.`,
`Study the NSG waiver negotiation and identify what India actually conceded.`,
`Compare public physics research funding across four countries as a share of GDP and against stated strategic priorities.`,
`Write on whether scientists have special political obligations arising from their knowledge.`
]
},

"logic|physics": {
brief: `Quantum mechanics broke the distributive law. Birkhoff and von Neumann pointed out in 1936 that the lattice of quantum propositions is not Boolean — "the particle passed through slit A or slit B" behaves differently from classical disjunction — and proposed quantum logic in response. Whether that means logic is empirical, as Putnam argued, or that we mislabelled the propositions, is unresolved. Separately, the physics of computation puts a hard limit on what can be deduced within physical resources.`,
developments: [
`Birkhoff and von Neumann's "The Logic of Quantum Mechanics" (1936) — the founding paper of quantum logic.`,
`Putnam's "Is Logic Empirical?" (1968) argued that we should revise logic in response to physics, exactly as we revised geometry.`,
`Bell's theorem is best understood as showing which logical assumptions about hidden variables are inconsistent with observation.`
],
relevance: [
`The Boolean lattice of classical propositions and the orthomodular lattice of quantum ones is the cleanest formal statement of what changed.`,
`Thought experiments — Maxwell's demon, Schrödinger's cat, the twin paradox — are deductive arguments checked for consistency, not experiments.`
],
projects: [
`Show explicitly where the distributive law fails using a two-slit proposition lattice.`,
`Write out the twin paradox as a formal argument and find the premise that dissolves it.`,
`Read Putnam's paper and write the best objection to revising logic empirically.`,
`Resolve Maxwell's demon using Landauer's principle, stating every premise.`,
`Build a truth-table style demonstration of Bell's inequality for a general audience.`
]
},

"debate|physics": {
brief: `Physics motions punish vagueness faster than almost any other category, because there is usually a number that settles the empirical part and leaves only the value question. "This house would go nuclear" is not a debate about danger in the abstract — it is a debate about deaths per terawatt-hour, capacity factors, waste volumes and construction timelines, and once those are on the table, the real disagreement turns out to be about risk tolerance and intergenerational fairness.`,
developments: [
`Nuclear energy's mortality per unit of energy is among the lowest of any source including renewables, which surprises most audiences and changes rooms.`,
`Fusion investment surged after the December 2022 NIF ignition result, though net electrical output remains far away — a distinction debaters must hold.`,
`India's Bharat Small Reactors announcement and the debate over opening nuclear power to private participation is a live domestic motion.`
],
relevance: [
`Orders of magnitude are a debating weapon. If you can do the estimation live, you can dismantle a claim before the opponent finishes making it.`,
`Beware of arguments that treat a physical limit as a policy preference, and vice versa.`
],
projects: [
`Build an evidence card on nuclear power with lifecycle emissions, mortality and cost data from primary sources.`,
`Prepare a Fermi estimation drill set — twenty questions with order of magnitude answers, timed.`,
`Debate whether fusion research funding is justified given its timeline, with real budget numbers.`,
`Take a science claim from a newspaper and rebuild it with correct units and magnitudes.`,
`Argue both sides of geoengineering research with the physics stated explicitly.`
]
},

"art|physics": {
brief: `Perspective is projective geometry discovered by painters — Brunelleschi worked out vanishing points around 1415, and the mathematics was formalised centuries later. Colour is more radical: the eye has three cone types, so colour space is three-dimensional, which is why very different spectra look identical and why every screen you own can fake almost everything with three primaries. Newton's <em>Opticks</em> gave us the spectrum; Goethe wrote an angry rival theory that was bad physics and excellent phenomenology.`,
developments: [
`Brunelleschi's demonstration of linear perspective (c. 1415) and Alberti's codification in 1435 turned painting into applied geometry.`,
`Newton's <em>Opticks</em> (1704) established the spectrum; Goethe's <em>Theory of Colours</em> (1810) attacked it and remains valuable for how colour is perceived rather than what it is.`,
`Structural analysis of pigments — X-ray fluorescence, infrared reflectography — routinely settles attribution and forgery disputes now.`
],
relevance: [
`Metamerism explains why two objects match under one light and clash under another, and why gallery lighting is a technical decision.`,
`Chladni figures, cymatics and the physics of musical timbre connect sound directly to visible pattern.`
],
projects: [
`Construct a one-point perspective drawing from the geometry alone, then photograph a real scene and verify the vanishing point.`,
`Build a metamerism demonstration using two colour samples and different light sources.`,
`Analyse a painting's pigments from published conservation reports and date it independently.`,
`Generate Chladni patterns with a speaker and sand, and compare against the plate equation's predictions.`,
`Write on whether Goethe's colour theory has any defensible content once the physics is corrected.`
]
},

"ai|math": {
brief: `Strip the branding and a neural network is a composition of affine maps and non-linearities, trained by gradient descent on a loss surface. The universal approximation theorem says a wide enough single layer can approximate any continuous function — which is almost useless practically, because it says nothing about how to find the weights or how many samples you need. The genuinely open question is why gradient descent finds good minima in a wildly non-convex landscape, and nobody has a complete answer.`,
developments: [
`Cybenko (1989) and Hornik (1991) proved universal approximation; three decades later the theory of why training works still lags the practice badly.`,
`The transformer (2017) is fundamentally a differentiable soft-lookup — attention is a weighted average with weights produced by dot products.`,
`Neural scaling laws (Kaplan 2020, Hoffmann 2022) turned model performance into a power law in compute, data and parameters, which is an empirical regularity nobody predicted from theory.`
],
relevance: [
`Backpropagation is the chain rule applied with dynamic programming. If you understand both, you understand training.`,
`The curse of dimensionality explains why high-dimensional intuition fails: in high dimensions almost all volume is near the surface.`
],
projects: [
`Implement backpropagation from scratch for a two-layer network with no framework, and verify gradients numerically.`,
`Visualise a loss landscape by taking two random directions in weight space and plotting the surface.`,
`Demonstrate the curse of dimensionality by measuring nearest-neighbour distances as dimension increases.`,
`Derive attention as a kernel-weighted average and explain it with matrices only.`,
`Fit a scaling law to your own experiments by training the same model at five sizes.`
]
},

"cs|math": {
brief: `The founding results of computer science are theorems about the limits of mathematics. Gödel showed arithmetic cannot prove its own consistency; Turing translated that into a machine and got the halting problem; the two are the same insight in different clothing. Everything downstream — complexity classes, decidability, the P versus NP problem — inherits from it. Cryptography then inverted the relationship: we build security on problems we <em>hope</em> are hard, without being able to prove any of them are.`,
developments: [
`Turing's 1936 paper defined computability and undecidability in one move, five years after Gödel's incompleteness theorems.`,
`Cook and Levin established NP-completeness (1971); P versus NP is now a Clay Millennium Problem and the field's central open question.`,
`Public key cryptography (Diffie–Hellman 1976, RSA 1977) rests on factoring and discrete log being hard, which remains unproven.`
],
relevance: [
`The Curry–Howard correspondence says programs are proofs and types are propositions, which is why proof assistants like Lean are also programming languages.`,
`Kolmogorov complexity gives a rigorous definition of randomness as incompressibility.`
],
projects: [
`Write a proof of the halting problem's undecidability and explain the diagonal argument to a Class 12 audience.`,
`Implement RSA from scratch with small primes and break it by factoring, then show why size defeats you.`,
`Prove one NP-complete reduction end to end, for example 3-SAT to vertex cover.`,
`Formalise a school-level theorem in Lean and report what the machine forced you to make explicit.`,
`Compute Kolmogorov-style compressibility of different files and connect it to randomness.`
]
},

"math|philosophy": {
brief: `Are mathematical objects discovered or invented? Platonism says the number seven exists independently of us, which explains why maths is objective and creates an impossible epistemology — how do we perceive abstract objects? Formalism says it is a game with symbols, which dissolves the problem and fails to explain applicability. Gödel's theorems ended the hope that formalism could be complete, and Gödel himself was a Platonist who thought his theorems supported it.`,
developments: [
`Frege's logicist programme collapsed when Russell sent him the paradox in 1902, and Frege published the acknowledgement anyway.`,
`Gödel's incompleteness theorems (1931) ended Hilbert's programme and remain the most philosophically abused results in mathematics.`,
`Benacerraf's dilemma (1973) sharpened the problem: any account that makes mathematical truth objective makes mathematical knowledge impossible, and vice versa.`
],
relevance: [
`Intuitionism rejects the law of excluded middle for infinite domains, which sounds academic until you notice it produces a different mathematics with constructive content.`,
`Read a real statement of Gödel's theorems before accepting any argument that invokes them about minds or machines.`
],
projects: [
`Write out Russell's paradox and explain precisely which axiom in naive set theory it destroys.`,
`Compare a constructive and a classical proof of the same theorem and articulate what is lost and gained.`,
`Take three popular claims about Gödel and check each against the actual theorems.`,
`Write a defence of Platonism, then of formalism, and identify the fact each cannot explain.`,
`Explore Benacerraf's dilemma using a specific mathematical claim you are confident is true.`
]
},

"history|math": {
brief: `The history of Indian mathematics is under-taught even in India. The Kerala school under Madhava had power series for sine, cosine and arctangent by around 1400, two centuries before Newton and Leibniz, and Nilakantha's work on infinite series has been documented since Whish reported it in 1834. Brahmagupta gave rules for zero and negative numbers in 628. The transmission question — whether any of it reached Europe — remains genuinely open and is argued seriously in both directions.`,
developments: [
`Madhava of Sangamagrama (c. 1340-1425) developed infinite series expansions now named for Gregory, Leibniz and Newton.`,
`Brahmagupta's <em>Brahmasphutasiddhanta</em> (628) contains the first systematic treatment of zero as a number and rules for negative quantities.`,
`Ramanujan's notebooks continued yielding new results into the 2010s, and the mock theta functions were only fully understood after 2002.`
],
relevance: [
`The decimal place value system's transmission through al-Khwarizmi to Europe is the single most consequential export in the history of mathematics.`,
`Beware both dismissal and inflation of Indian mathematical priority. Read Kim Plofker's history for the disciplined version.`
],
projects: [
`Derive the Madhava–Leibniz series for pi and compute its convergence rate — then explain why it was impractical.`,
`Compare Brahmagupta's rules for zero against modern axioms and find where they differ.`,
`Study one Ramanujan identity and write about how he might have found it.`,
`Trace the numeral system's route from India to Europe with dated sources.`,
`Assess the transmission hypothesis for the Kerala school fairly, stating what evidence would settle it.`
]
},

"math|politics": {
brief: `Apportionment and districting are mathematics with power attached. Arrow's theorem says no voting rule satisfies a short list of reasonable conditions; the Gibbard–Satterthwaite theorem says every non-trivial rule can be manipulated by strategic voting. India's delimitation freeze, held since 1976 and now scheduled to lift after 2026, means southern states that controlled population growth face losing parliamentary seats to northern states that did not — a fairness problem with no mathematically neutral answer.`,
developments: [
`Arrow (1951) and Gibbard–Satterthwaite (1973, 1975) between them close off the hope of a manipulation-proof, fair voting rule.`,
`The efficiency gap measure of gerrymandering was proposed in 2015 and used in US litigation, giving courts a number to argue about.`,
`India's delimitation freeze, extended by the 84th Amendment to 2026, has become one of the sharpest federal questions in Indian politics.`
],
relevance: [
`The Alabama paradox and the population paradox show apportionment methods can behave perversely — adding seats can cost a state one.`,
`Quadratic voting and other mechanisms attempt to price intensity of preference rather than count heads.`
],
projects: [
`Compute how Lok Sabha seats would redistribute under three different apportionment methods after the freeze lifts.`,
`Build a voting simulator demonstrating Gibbard–Satterthwaite manipulation on real preference data.`,
`Calculate the efficiency gap for a set of Indian assembly constituencies.`,
`Model the Alabama paradox with a concrete example and explain it without formulas.`,
`Write a proposal for a delimitation formula that balances representation and federalism, and defend its trade-offs.`
]
},

"logic|math": {
brief: `Mathematical logic is where mathematics turned on itself and asked what a proof is. The programme was Hilbert's — formalise everything, then prove the formal system consistent and complete — and Gödel killed it in 1931. What survived is enormously productive: model theory, proof theory, set theory and computability all came from the wreckage, and the whole apparatus is now running inside proof assistants that verify mathematics mechanically.`,
developments: [
`Gödel's completeness theorem (1929) and incompleteness theorems (1931) — note that these say opposite-sounding things about different objects, and confusing them is the most common error.`,
`Cohen's forcing (1963) proved the continuum hypothesis independent of ZFC, showing set theory has genuine choices in it.`,
`The Lean theorem prover's formalisation of major results, including work led by Kevin Buzzard and the 2023-24 formalisation projects, made machine-checked mathematics practical.`
],
relevance: [
`ZFC is a choice, not a discovery. Alternative foundations — type theory, category theory — are live options.`,
`The axiom of choice implies the Banach–Tarski paradox, which is a good test of how much you trust your axioms.`
],
projects: [
`State and distinguish the completeness and incompleteness theorems precisely, in one page.`,
`Formalise a basic number theory proof in Lean and report every gap the assistant found.`,
`Explain forcing at an intuitive level, honestly flagging what the intuition hides.`,
`Work through the Banach–Tarski construction outline and identify exactly where choice enters.`,
`Compare set-theoretic and type-theoretic foundations on what each makes easy.`
]
},

"debate|math": {
brief: `Numbers are the most persuasive and least examined objects in a debate. The skills that matter are unglamorous: Fermi estimation to sanity-check a claim live, understanding base rates so that a scary-sounding relative risk gets converted into an absolute one, and knowing that "average" is three different statistics that diverge whenever a distribution is skewed. Anyone who can do a back-of-envelope calculation while speaking has an unfair advantage, and it is entirely trainable.`,
developments: [
`Simpson's paradox — an effect that reverses when data is aggregated — has decided real policy arguments, most famously the Berkeley admissions case of 1973.`,
`Base rate neglect was documented by Kahneman and Tversky and is still the most reliable way to make a rare event sound common.`,
`Data visualisation has become an argumentative medium, and truncated axes are now the standard deception.`
],
relevance: [
`Mean, median and mode diverge exactly when the distribution matters most — income, wealth, disease severity.`,
`A relative risk increase of 100% on a base rate of one in a million is still one in five hundred thousand. Say both numbers.`
],
projects: [
`Build a Fermi estimation drill set on Indian public numbers and practise until you are within an order of magnitude.`,
`Find a published statistic and reconstruct it from the primary data to see what was chosen and discarded.`,
`Construct a Simpson's paradox example from real Indian data.`,
`Collect ten misleading charts from news media and redraw each honestly.`,
`Prepare a rebuttal template for any claim presented as a percentage without a denominator.`
]
},

"art|math": {
brief: `The relationship is far older and stranger than the golden ratio stories suggest — most of those are retrofitted, and Livio's book is a good corrective. What is real: perspective is projective geometry, Islamic geometric tiling anticipated quasi-crystal symmetry by five centuries, Bach's counterpoint is transformation groups applied to melody, and Escher worked directly with Coxeter on hyperbolic tessellation. Generative and algorithmic art turned the relationship explicit — the artwork is now a function.`,
developments: [
`Penrose tilings (1974) exhibit five-fold symmetry without periodicity; equivalent patterns appear in the 15th-century Darb-i Imam shrine in Isfahan.`,
`Escher and Coxeter's correspondence from 1954 led directly to the Circle Limit prints, one of the few genuine mathematician-artist collaborations.`,
`Algorithmic art platforms from 2020 onward made generative work with on-chain randomness a distinct medium.`
],
relevance: [
`Fractal analysis of Pollock's drip paintings claimed a consistent fractal dimension; the claim has been contested, which makes it a better case study than if it were settled.`,
`Indian temple architecture encodes proportional systems in the shilpa shastras that are worth reading as mathematics.`
],
projects: [
`Construct a Penrose tiling by hand and prove it cannot repeat.`,
`Generate an Escher-style hyperbolic tessellation in code using the Poincaré disk model.`,
`Analyse a Bach fugue's transformations as group operations and notate them.`,
`Measure proportional ratios in a temple you can visit and compare against the shastric prescription.`,
`Build a generative art piece where the parameters have a stated mathematical meaning, not just aesthetic tuning.`
]
},

"ai|cs": {
brief: `AI used to be a subfield of computer science and is now visibly eating the practice of it. The theoretical relationship is old — search, heuristics, knowledge representation and logic programming were CS topics long before deep learning — but the engineering relationship is what changed: a modern model is a systems problem, where distributed training, memory bandwidth and interconnect decide what is possible more than any algorithmic insight does. Programming itself has become a natural language interface problem.`,
developments: [
`The bitter lesson (Sutton, 2019): general methods that scale with compute have consistently beaten methods that encode human knowledge, across every subfield.`,
`Transformer scaling shifted the bottleneck from algorithms to infrastructure — memory bandwidth and interconnect now govern training throughput.`,
`Code generation moved from autocomplete to agentic multi-file editing between 2021 and 2025, which changes what a junior developer's job consists of.`
],
relevance: [
`GPU memory hierarchy and attention's quadratic cost explain most architectural innovation since 2020, including FlashAttention and sparse attention.`,
`Retrieval-augmented generation is a database problem wearing an AI hat.`
],
projects: [
`Implement a small transformer from scratch and profile where the time actually goes.`,
`Build a retrieval system over your own notes and measure retrieval quality separately from generation quality.`,
`Compare a hand-written heuristic solver and a learned model on the same puzzle, on accuracy and compute.`,
`Instrument a training run and plot throughput against batch size to find your hardware's real limit.`,
`Write an honest assessment of what code generation did and did not change in your own workflow over a month.`
]
},

"ai|philosophy": {
brief: `Searle's Chinese Room says syntax is not sufficient for semantics; the systems reply says the room as a whole understands. Neither side has moved much in forty years, but the argument now has commercial stakes. The sharper contemporary questions are about the criteria: what evidence would establish machine understanding, and would we accept it? Add the alignment problem — Bostrom and Russell's argument that a competent optimiser with slightly wrong objectives is dangerous precisely because it is competent — and philosophy of mind becomes engineering-relevant.`,
developments: [
`Turing's imitation game (1950) proposed a behavioural test and explicitly refused to define thinking, which most commentators forget.`,
`Searle's Chinese Room (1980) is the standard counter-argument, and the systems reply is the standard counter-counter.`,
`Russell's <em>Human Compatible</em> (2019) reframed alignment as uncertainty about objectives rather than specification of them.`
],
relevance: [
`Chalmers's hard problem asks why there is experience at all, not just processing — a distinction that survives every advance in capability.`,
`Moral status is the question nobody wants: if a system had morally relevant interests, how would we know?`
],
projects: [
`Write the Chinese Room and three replies, then state which premise you reject and why.`,
`Design a test for machine understanding that you would actually accept, and predict how it could be gamed.`,
`Read Russell's reformulation of the control problem and write the strongest technical objection.`,
`Compare functionalism and biological naturalism on what each predicts about machine minds.`,
`Write on whether the hard problem is a real problem or a confusion about language.`
]
},

"ai|history": {
brief: `AI has had two winters and both followed the same pattern: a demonstration, a funding surge, over-promising, and then a public report that stopped the money. The Lighthill report in 1973 gutted British AI research; the collapse of the expert system market ended the second boom around 1990. Knowing this history is not pessimism, it is calibration — the current cycle has real capability behind it, but the failure mode of every previous cycle was extrapolating from a working demonstration to a general claim.`,
developments: [
`The Dartmouth workshop (1956) named the field and predicted major progress in a summer, setting the tone for seventy years of timeline optimism.`,
`The Lighthill report (1973) and the second winter around 1987-1993 both followed periods of confident public prediction.`,
`Deep learning's revival is precisely dateable: AlexNet in 2012, then AlphaGo in 2016, then the transformer in 2017.`
],
relevance: [
`Perceptrons by Minsky and Papert (1969) is usually blamed for killing neural network research; the actual history is more complicated and worth reading.`,
`India's own computing history — from TIFRAC in 1960 to the C-DAC PARAM supercomputers built after export restrictions — is a case study in constraint-driven innovation.`
],
projects: [
`Build a dated timeline of AI predictions against what actually happened, scoring each.`,
`Read the Lighthill report and assess which of its criticisms have been answered.`,
`Study the expert systems boom and identify what technical limit ended it.`,
`Write on whether the current cycle differs structurally from previous ones, with specific criteria.`,
`Research the PARAM supercomputer programme and what export controls produced.`
]
},

"ai|politics": {
brief: `Compute is a strategic resource now, and export controls have made that official — the US restrictions on advanced chips to China from October 2022 onward are industrial policy conducted through semiconductors. Domestically, the fights are about surveillance, content moderation at scale, and automated welfare decisions. India sits in an unusual position: a large deployment market, a growing talent base, minimal compute manufacturing, and a regulatory approach that has swung between advisory and permissive within single years.`,
developments: [
`US export controls on advanced semiconductors to China (October 2022, tightened repeatedly since) turned compute into an instrument of foreign policy.`,
`The EU AI Act (2024) and the US executive orders on AI, later revised, represent two different regulatory philosophies — risk tiering versus agency-led standards.`,
`India's IndiaAI Mission, approved in 2024, committed public funding to shared GPU capacity, signalling compute as public infrastructure.`
],
relevance: [
`Deepfakes and synthetic media in elections are now a documented phenomenon in Indian campaigns, not a hypothetical.`,
`Facial recognition deployment in Indian policing has expanded well ahead of any statutory framework governing it.`
],
projects: [
`Map global AI compute capacity by country and assess India's realistic position.`,
`Compare the EU AI Act and India's approach and write what each optimises for.`,
`Document verified cases of synthetic media in one Indian election cycle and assess measurable effect.`,
`Analyse the IndiaAI Mission's allocation against what training a frontier model actually requires.`,
`Draft a statutory framework for facial recognition use by police with specific safeguards.`
]
},

"ai|logic": {
brief: `The field's founding split is logic versus statistics, and it has swung twice. Symbolic AI encoded knowledge as rules and hit the brittleness wall; connectionist systems learned statistics and hit the reliability wall. Neurosymbolic work is the attempt to get both, and the most practical version right now is using a language model to generate formal artefacts — code, proof steps, constraint specifications — that a verifier can check, because generation is unreliable and verification is not.`,
developments: [
`Logic Theorist (1956) proved theorems from Principia Mathematica, and the symbolic tradition dominated for thirty years.`,
`Expert systems like MYCIN performed well in narrow domains and failed to generalise, defining the brittleness problem.`,
`AlphaGeometry (2024) combined a language model with a symbolic deduction engine and solved olympiad geometry near gold-medal level — the clearest neurosymbolic result yet.`
],
relevance: [
`SAT and SMT solvers quietly do enormous industrial work — verification, scheduling, program analysis — with no learning involved.`,
`Chain of thought is not reasoning in a logical sense; the tokens are not a proof and can be unfaithful to the computation.`
],
projects: [
`Build a small expert system for a domain you know and document exactly where it becomes brittle.`,
`Use an SMT solver to verify a program property and compare against testing.`,
`Have a language model produce a proof and verify it in Lean, recording the failure rate.`,
`Study AlphaGeometry's architecture and write which part does the actual reasoning.`,
`Test whether a model's stated chain of thought matches its answer when you perturb the reasoning.`
]
},

"ai|debate": {
brief: `Two things are happening. AI as a debating tool — research, case generation, drilling against an opponent that never tires — and AI as a debating subject, where motions about regulation, liability and labour turn up constantly. There is also a serious research programme here: debate was proposed as an alignment technique, where two models argue and a weaker judge decides, on the theory that it is easier to spot a flaw in an argument than to construct the truth alone.`,
developments: [
`Irving, Christiano and Amodei's "AI safety via debate" (2018) proposed adversarial argument as a scalable oversight method.`,
`IBM Project Debater competed against a human champion in 2019 and lost on persuasion while winning on information retrieval — a useful distinction.`,
`Recent work on debate protocols has tested whether weaker judges reach correct answers more often when two stronger models argue, with mixed but real results.`
],
relevance: [
`Using AI for evidence carries a specific risk: fabricated citations are fluent and confident, and have already embarrassed lawyers in real filings.`,
`The best current use is adversarial preparation — ask a model to destroy your case, not to build it.`
],
projects: [
`Run a structured debate between two models on a motion you know well and grade the arguments yourself.`,
`Build a rebuttal drill tool that generates the strongest counter to any case you paste in.`,
`Audit twenty AI-generated citations on a topic and record the fabrication rate.`,
`Replicate a simplified debate-as-oversight experiment with a weaker judge model.`,
`Prepare both sides of "This house would require disclosure of AI use in competitive debate".`
]
},

"ai|art": {
brief: `The interesting question is not whether AI art is art but what it does to the labour market and to authorship. Diffusion models learn to reverse a noising process, which is why they can start from noise and arrive at an image; the training data question is what makes it contested. Commercially, the effect landed first on the people doing volume work — concept art, stock illustration, storyboards — while the top of the market was unaffected, which is exactly the pattern of every previous automation wave.`,
developments: [
`Stable Diffusion's public release in August 2022 made image generation ubiquitous overnight, unlike closed competitors.`,
`The US Copyright Office ruled in 2023 that AI-generated images lack the human authorship required for copyright.`,
`Artist-led litigation against image model developers from 2023 onward will decide whether training on scraped work is fair use.`
],
relevance: [
`Benjamin's essay on mechanical reproduction and the aura of the original was written about photography and reads as if written about this.`,
`Style is not copyrightable, which is legally clear and emotionally intolerable to working artists — that gap is the whole fight.`
],
projects: [
`Implement a small diffusion model on a simple dataset and explain the denoising process in your own words.`,
`Interview three working Indian illustrators about what actually changed in their commissions.`,
`Write a policy proposal for compensating artists whose work trained a model, with a workable mechanism.`,
`Read Benjamin's essay and write a response applying it to generative models.`,
`Curate a blind comparison of human and generated work and record what people actually detect.`
]
},

"cs|philosophy": {
brief: `Computation gave philosophy a new vocabulary and philosophy gave computation its foundations. Functionalism — mental states are defined by their causal roles, not their substrate — is essentially a software metaphor, and it dominated philosophy of mind for decades because computers made it thinkable. Meanwhile the Curry–Howard correspondence identified proofs with programs, which turns constructive logic into a programming discipline. Then there is the ethics of building things: privacy, autonomy and manipulation are now design decisions, not afterthoughts.`,
developments: [
`Putnam's machine functionalism (1960s) made the mind-as-software analogy respectable, and he later abandoned it.`,
`The Curry–Howard correspondence connected intuitionistic logic to typed lambda calculus, and underlies every dependently typed language.`,
`Bostrom's simulation argument (2003) is a probabilistic trilemma, not a claim — most people who cite it get this wrong.`
],
relevance: [
`Dark patterns are applied philosophy of autonomy: what counts as manipulation rather than persuasion?`,
`Wittgenstein on rule-following is directly relevant to what it means for a machine to follow an instruction.`
],
projects: [
`Write out the simulation argument as a formal trilemma and identify which horn you reject.`,
`Implement a small dependently typed proof and explain Curry–Howard through it.`,
`Audit an app you use daily for dark patterns and classify each by which autonomy condition it violates.`,
`Write on whether functionalism survives the multiple realisability objections that Putnam himself later raised.`,
`Build an ethics checklist you would actually apply to your own projects, and test it on a past one.`
]
},

"cs|history": {
brief: `Computing history is mostly the history of wartime and state funding, which is uncomfortable for the industry's self-image. Bletchley Park, ENIAC's ballistics tables, ARPANET's survivable communications — the origin stories are military. India's own trajectory is a different lesson: export restrictions on supercomputers led directly to C-DAC building PARAM in 1991, and the software services industry grew because of a specific accident of timing involving Y2K and telecom cost collapse.`,
developments: [
`Bletchley Park's Colossus (1943-44) was the first programmable electronic computer, and stayed classified until the 1970s, distorting the historical record.`,
`ARPANET's first message in 1969 and TCP/IP's adoption in 1983 built an internet designed for resilience, not security — a decision we are still paying for.`,
`India's IT services boom traces to a specific window: liberalisation in 1991, Y2K remediation demand, and collapsing international bandwidth costs.`
],
relevance: [
`Grace Hopper's compiler work and Ada Lovelace's notes are routinely mentioned and rarely read. Read the primary sources.`,
`The Unix philosophy and its diffusion through Bell Labs' antitrust-driven licensing terms is a case of legal accident shaping technology.`
],
projects: [
`Write the history of one protocol you use daily and identify the design decision that aged worst.`,
`Study C-DAC's PARAM programme and what export controls actually produced.`,
`Trace the Indian IT services boom with employment and revenue data by year.`,
`Read Lovelace's Note G and assess what she actually claimed.`,
`Analyse how Bell Labs' licensing terms shaped Unix adoption and what would have happened otherwise.`
]
},

"cs|politics": {
brief: `Software is governance now. Recommendation ranking decides what a hundred million people see, content moderation is speech policy administered privately at scale, and India's digital public infrastructure — Aadhaar, UPI, DigiLocker — makes the state a platform operator. The privacy fight here is unusually well documented: the Puttaswamy judgment in 2017 established a fundamental right to privacy, and the DPDP Act in 2023 delivered a framework with wide state exemptions.`,
developments: [
`Puttaswamy (2017) unanimously held privacy to be a fundamental right under Article 21, overruling two older judgments.`,
`Aadhaar was upheld in 2018 for welfare delivery but struck down for private-sector mandatory use, drawing a line that has since been eroded in practice.`,
`Open source has become geopolitical: sanctions, export controls on model weights, and dependency on foreign infrastructure are now security questions.`
],
relevance: [
`Section 69A blocking orders in India are issued without published reasoning, which makes the process itself the civil liberties issue.`,
`Algorithmic amplification liability is the unresolved question that both Section 230 and Section 79 debates orbit.`
],
projects: [
`Read the Puttaswamy proportionality test and apply it to a current data collection programme.`,
`Compare the DPDP Act against GDPR on consent, exemptions and enforcement.`,
`Study how a recommendation algorithm's ranking changes what a test account sees over two weeks.`,
`Analyse Aadhaar authentication failure rates and their welfare consequences from public data.`,
`Write a proposal for transparency requirements on blocking orders.`
]
},

"cs|logic": {
brief: `Boolean algebra was pure logic from 1847 until Shannon noticed in 1937 that switching circuits obey the same laws — a master's thesis that created digital electronics. Everything since inherits: type systems are logics, static analysis is automated deduction, and formal verification proves programs correct rather than testing them. The practical frontier is that verification is now cheap enough for real systems, with seL4 and CompCert as the standing proofs that it can be done.`,
developments: [
`Shannon's 1937 thesis mapped Boolean algebra onto relay circuits, arguably the most consequential master's thesis ever written.`,
`The seL4 microkernel (2009) was formally verified down to its C implementation, proving full functional correctness is achievable for real software.`,
`SAT solvers improved by orders of magnitude from the 1990s onward and now handle industrial verification problems with millions of clauses.`
],
relevance: [
`Prolog and logic programming compute by proof search, which is a genuinely different mental model from imperative code.`,
`Rust's borrow checker is a logic that rejects programs violating an ownership property — types as theorems, in production.`
],
projects: [
`Build a SAT solver with DPLL and unit propagation, then use it to solve a real scheduling problem.`,
`Verify a small algorithm's correctness in a proof assistant and compare the effort against writing tests.`,
`Write the same program in Prolog and Python and compare what each makes natural.`,
`Study seL4's verification approach and write what would prevent applying it more widely.`,
`Encode a logic puzzle as a SAT instance and measure how solve time scales with size.`
]
},

"cs|debate": {
brief: `Technology motions are lost by people who argue about technology in the abstract. Encryption debates are won by whoever explains what a backdoor actually requires — that there is no mathematical way to build access for one party only. Platform regulation debates are won by whoever knows the difference between hosting, recommending and amplifying. The transferable habit is mechanism: never argue that something is harmful, argue how the harm is produced, step by step.`,
developments: [
`The Apple versus FBI dispute (2016) crystallised the encryption backdoor argument and remains the best case study for it.`,
`The IT Rules 2021 traceability mandate in India forced the argument into a domestic court, where the technical impossibility claim is being tested directly.`,
`Interoperability and data portability have become the preferred remedy in platform competition cases, which changes what the debate is about.`
],
relevance: [
`Metcalfe's law and network effects are the mechanism behind most platform dominance claims, and the law itself is a rough approximation at best.`,
`"Just add a filter" is the most common technically illiterate proposal in content moderation debates. Learn why it fails.`
],
projects: [
`Build an evidence file on encryption backdoors with the actual cryptographic argument stated precisely.`,
`Prepare both sides of "This house would break up large technology platforms", with a defined remedy.`,
`Analyse the traceability requirement's technical feasibility and write it up for a non-technical judge.`,
`Study a content moderation failure and diagram exactly where the pipeline broke.`,
`Debate whether source code should be treated as protected speech.`
]
},

"art|cs": {
brief: `Creative coding is a genuine discipline with a lineage — Processing, openFrameworks, Shadertoy, and the demoscene, which spent thirty years extracting impossible visuals from tiny binaries. The technical vocabulary is worth having: shaders are programs that run per pixel, Perlin noise gives you controllable randomness, and L-systems generate plants from rewriting rules. Interface design is where this pays rent, because most of what makes software feel good is craft that has nothing to do with correctness.`,
developments: [
`Processing (2001) made programming accessible to artists and produced a generation of practitioners who write code as a medium.`,
`Perlin noise (1983) won an Academy Award for technical achievement and is in essentially every procedurally generated texture you have seen.`,
`Shader-based generative art matured through Shadertoy from 2013, with an entire aesthetic emerging from what fits in a fragment shader.`
],
relevance: [
`The demoscene's 64KB intros remain the best demonstration of what constraint does to creativity.`,
`Typography on screen is a rendering problem — hinting, subpixel antialiasing, kerning — and it is why text looks better on some systems than others.`
],
projects: [
`Write a fragment shader that generates an animated pattern from noise alone, no textures.`,
`Implement an L-system and grow a plant, then vary the rules to produce a species.`,
`Build a generative piece where a data source you care about drives the visual parameters.`,
`Recreate a demoscene effect — plasma, tunnel, metaballs — from first principles.`,
`Design and build one interface screen at production quality and document every craft decision.`
]
},

"history|philosophy": {
brief: `Does history have a direction? Hegel said yes and Marx inverted him to say it was material rather than spiritual; Popper spent <em>The Poverty of Historicism</em> arguing that the entire question is malformed because you cannot predict history without predicting the growth of knowledge, which is impossible in principle. Underneath sits a quieter problem: historical explanation requires counterfactuals, and counterfactuals about the past cannot be tested, so historiography is permanently arguing about what kind of knowledge it produces.`,
developments: [
`Popper's <em>The Poverty of Historicism</em> (1957) attacked historical inevitability directly and remains the standard reference for the argument.`,
`Collingwood's <em>The Idea of History</em> (1946) held that historical understanding requires re-enacting the thought of past agents — a strong and contested claim.`,
`The Annales school shifted attention from events to long-duration structures, changing what counted as a historical question at all.`
],
relevance: [
`Whig history — reading the past as progress towards the present — is the most common failure mode in popular history writing, including Indian nationalist and colonial versions alike.`,
`Subaltern Studies asked whose consciousness gets recorded, which is an epistemological question before it is a political one.`
],
projects: [
`Take one historical event and write it from a Marxist, a Whig and an Annales perspective.`,
`Assess Popper's argument against historicism and identify what it does not rule out.`,
`Write on whether counterfactual history produces knowledge, using a specific well-argued case.`,
`Read a Subaltern Studies essay and articulate its methodological claim separately from its politics.`,
`Examine a school history textbook chapter for implicit philosophy of history.`
]
},

"philosophy|politics": {
brief: `Political philosophy is the argument about what the state may do to you and why. The social contract tradition — Hobbes for security, Locke for property, Rousseau for the general will — all invent a founding agreement nobody signed. Rawls revived the field in 1971 with the veil of ignorance, a device for deriving principles you would accept without knowing your position; Nozick answered within three years that any pattern of distribution requires continuous interference with liberty. In India the frame differs: Ambedkar's constitutional morality places social democracy before political democracy.`,
developments: [
`Rawls's <em>A Theory of Justice</em> (1971) restarted analytic political philosophy; Nozick's reply (1974) defined the libertarian counter-position.`,
`Ambedkar's "Annihilation of Caste" (1936) and his Constituent Assembly speeches argue that political equality without social equality is unstable — a claim with a testable history.`,
`Sen and Nussbaum's capability approach shifted the metric of justice from resources to real freedoms, influencing development policy globally.`
],
relevance: [
`The is-ought gap means no amount of social science establishes what should be done — a point ignored in most policy writing.`,
`Communitarian critiques from MacIntyre and Sandel argue the unencumbered self of liberal theory does not exist.`
],
projects: [
`Apply the veil of ignorance to one live Indian policy question and see where it lands you.`,
`Compare Ambedkar's and Rawls's accounts of justice and identify their sharpest disagreement.`,
`Write the strongest libertarian objection to redistribution, then the strongest reply.`,
`Assess whether the capability approach can generate a determinate policy ranking.`,
`Read Sandel's critique of Rawls and write whether it lands.`
]
},

"logic|philosophy": {
brief: `Logic was philosophy's own child and then left home. Aristotle's syllogistic held for two thousand years until Frege rebuilt logic on quantifiers and functions in 1879, which made modern analytic philosophy possible. The Vienna Circle then tried to use logic to eliminate metaphysics entirely, and failed on its own terms — the verification principle cannot verify itself. What survives is a permanent standard: an argument is a set of premises and an inference, and both are open to attack, separately.`,
developments: [
`Frege's <em>Begriffsschrift</em> (1879) invented quantificational logic and is the founding document of analytic philosophy.`,
`Russell's theory of descriptions (1905) showed how logical form can differ from grammatical form, dissolving apparent puzzles about non-existent objects.`,
`Quine's "Two Dogmas of Empiricism" (1951) attacked the analytic-synthetic distinction and undermined logical positivism from inside.`
],
relevance: [
`Modal logic gave philosophy possible-worlds semantics, which is now the standard tool for necessity, counterfactuals and knowledge.`,
`Indian logic — the Nyaya school's five-membered inference, and the Buddhist catuskoti — is a genuinely different tradition, not a lesser version of the Greek one.`
],
projects: [
`Formalise five arguments from a philosophy text in predicate logic and note what the formalisation clarifies.`,
`Compare the Nyaya inference schema against the Aristotelian syllogism on a shared example.`,
`Write out Russell's analysis of "the present King of France is bald" and explain the move.`,
`Assess whether the verification principle is self-defeating and whether that matters.`,
`Explore the catuskoti's four positions and whether they can be captured in a classical or paraconsistent system.`
]
},

"debate|philosophy": {
brief: `Every value debate is applied ethics whether the room admits it or not, and knowing the frameworks lets you name what your opponent is doing. Most competitive arguments reduce to a consequentialist claim, a deontological constraint, or a claim about character and institutions — and the sharpest move available is usually to accept your opponent's framework and defeat them inside it. Socratic method is the ancestor of cross-examination: the questions do the work, not the assertions.`,
developments: [
`The trolley problem, from Foot (1967) and Thomson (1985), remains the cleanest device for separating consequentialist and deontological intuitions.`,
`Reflective equilibrium, from Rawls, is the standard method for reconciling principles and intuitions, and describes what a good debater does in preparation.`,
`Steelmanning became a named norm in online rationalist writing and has quietly raised the standard for what counts as an honest rebuttal.`
],
relevance: [
`The naturalistic fallacy and the appeal to nature turn up constantly in bioethics and environment motions.`,
`Burden of proof allocation decides more debates than evidence does, and is itself an argument worth making explicitly.`
],
projects: [
`Prepare one motion three times, from utilitarian, deontological and virtue positions.`,
`Build a fallacy field guide with a real example of each from actual speeches you have heard.`,
`Run a Socratic cross-examination drill where only questions are permitted.`,
`Write the strongest steelman of a position you find obviously wrong, then say what still fails.`,
`Analyse a recorded final round and map every value claim onto its underlying framework.`
]
},

"art|philosophy": {
brief: `Aesthetics is the branch of philosophy that keeps being told it does not matter and keeps turning out to. Kant's argument in the third Critique is that a judgement of beauty is subjective yet claims universal assent — you do not merely report a preference, you say others ought to agree, without being able to prove it. Danto's answer to what makes something art is institutional: Warhol's Brillo Boxes were visually identical to the supermarket object, so the difference had to lie in theory and context, not appearance.`,
developments: [
`Kant's <em>Critique of Judgment</em> (1790) framed the problem of aesthetic judgement that everything since responds to.`,
`Danto's "The Artworld" (1964), written after seeing Warhol's Brillo Boxes, launched institutional theories of art.`,
`Rasa theory, from the Natyashastra and elaborated by Abhinavagupta, is a fully developed aesthetics built on emotional response rather than beauty — a genuinely different starting point.`
],
relevance: [
`The intentional fallacy — Wimsatt and Beardsley (1946) — argues the artist's intention is neither available nor decisive for interpretation.`,
`Tolstoy's <em>What Is Art?</em> makes the moral case for art as emotional transmission, and rejects most of the canon for failing it.`
],
projects: [
`Compare rasa theory and Kantian aesthetics on the same artwork and report what each notices.`,
`Write on whether the institutional theory of art can exclude anything at all.`,
`Take a work you love and interpret it once with and once without the artist's stated intention.`,
`Assess Tolstoy's criterion by applying it honestly to five works.`,
`Argue whether an AI-generated image can be beautiful in Kant's sense.`
]
},

"history|politics": {
brief: `Political arguments are fought with historical claims, and most of them are wrong. Every constitution is a response to a specific past failure — India's emergency provisions come from the Government of India Act 1935, the amendments after 1975 come from the Emergency itself. Path dependence is the useful analytical idea: institutions persist because switching costs are high, so a decision taken for a forgotten reason in 1935 can still be constraining behaviour today.`,
developments: [
`The Emergency (1975-77), the 42nd Amendment and the 44th Amendment that reversed much of it form the sharpest institutional sequence in Indian political history.`,
`Linguistic reorganisation of states from 1956 settled a question that had threatened the union, and is a genuine institutional success story worth studying.`,
`Acemoglu and Robinson's <em>Why Nations Fail</em> (2012) popularised the institutional explanation of divergence — widely read, and widely criticised for circularity.`
],
relevance: [
`Historical memory is a political resource, and how textbooks narrate events is itself a recurring political fight in India.`,
`Comparing decolonisation trajectories across India, Pakistan, Indonesia and Ghana isolates which factors actually mattered.`
],
projects: [
`Chart the 42nd and 44th Amendments clause by clause and write what each was reacting to.`,
`Study the States Reorganisation Commission and assess why linguistic federalism worked here and not everywhere.`,
`Compare two textbook editions on the same event and analyse the changes.`,
`Test the institutional hypothesis against a case it handles badly.`,
`Write a path-dependence account of one Indian institution from its colonial origin to today.`
]
},

"history|logic": {
brief: `Historical reasoning is inference to the best explanation under permanently incomplete evidence, which makes it a good training ground for careful thinking. The recurring formal errors have names: post hoc reasoning treats sequence as cause, presentism imports current concepts into periods that lacked them, and survivorship bias means the sources that reached you are exactly the ones somebody chose to preserve. Source criticism is applied logic — establish provenance, establish interest, then weigh.`,
developments: [
`Abduction, formalised by Peirce, is the inference pattern historians actually use, and it is not deductively valid.`,
`Carlo Ginzburg's evidential paradigm compared historical method to medical diagnosis and detective work — reasoning from traces.`,
`Bayesian approaches to historical claims have been attempted, most visibly in biblical and ancient history, with contested results.`
],
relevance: [
`Absence of evidence is weak evidence of absence, and how weak depends entirely on how likely evidence was to survive.`,
`Anachronism is a category error, not merely a mistake of dating — applying the concept of nationalism to the 12th century is a logical failure.`
],
projects: [
`Take a disputed historical claim and lay out the argument formally, with explicit premises.`,
`Assess a primary source for provenance, interest and corroboration, and write the analysis.`,
`Attempt a Bayesian treatment of a historical question and report where it breaks down.`,
`Find three post hoc arguments in popular history writing and rewrite them honestly.`,
`Write on what makes an explanation better than a rival when neither can be tested.`
]
},

"debate|history": {
brief: `Historical analogy is the most powerful and most abused device in political argument. Munich means appeasement, Weimar means democratic collapse, Vietnam means quagmire — and each carries an implied causal claim that usually goes unexamined. The disciplined use is Neustadt and May's: state the analogy, list the likenesses and the differences explicitly, and then judge whether the differences break the inference. Doing this out loud in a round is devastating against an opponent who reached for a comparison.`,
developments: [
`Neustadt and May's <em>Thinking in Time</em> (1986) developed a method for using history in policy decisions that is still taught in government schools.`,
`Reductio ad Hitlerum, named by Leo Strauss, describes the argumentative move of discrediting a position by association with the worst historical case.`,
`Public history controversies over monuments and naming have made the interpretation of the past a recurring competitive motion.`
],
relevance: [
`Counterfactual claims in debate need the same discipline as in history: what specifically would have been different, and by what mechanism?`,
`Nationalist and colonial historiography make opposite errors on the same events, and reading both is the fastest way to see the shape of each.`
],
projects: [
`Take five historical analogies used in recent political argument and test each with the likeness-difference method.`,
`Prepare a motion on historical monuments with primary sources rather than commentary.`,
`Build a case file on one contested historical question with the strongest version of both sides.`,
`Analyse a political speech for its historical claims and check each.`,
`Debate whether states should legislate on historical interpretation.`
]
},

"art|history": {
brief: `Art is a primary source that most people read badly. A painting records what was worth depicting, who could afford to commission it, and what the depicter assumed the viewer already knew — Ajanta's frescoes tell you about patronage networks and pigment trade as much as about Buddhism. Style also travels along trade routes, which is why Gandhara sculpture has Hellenistic drapery and why that single fact carries an entire history of contact.`,
developments: [
`Gandhara art (roughly 1st to 5th centuries CE) fused Greco-Roman form with Buddhist subject matter, physically recording the aftermath of Alexander's campaigns.`,
`The Ajanta caves span roughly the 2nd century BCE to the 6th century CE and preserve painting techniques and social detail available nowhere else in Indian sources.`,
`Company painting, produced by Indian artists for British patrons from the late 18th century, documents the colonial encounter from an unusual position.`
],
relevance: [
`Pigment analysis dates and locates works independently of stylistic argument, and has overturned attributions.`,
`Iconography is a language: knowing what a mudra or an attribute signifies turns a picture into a readable text.`
],
projects: [
`Analyse one Gandhara sculpture for its Hellenistic and Indian elements, feature by feature.`,
`Study the Ajanta paintings as evidence about clothing, trade goods and social hierarchy.`,
`Compare a Company painting with a contemporaneous British depiction of the same subject.`,
`Trace one pigment's trade route and what its presence dates.`,
`Build an iconographic key for a temple you can visit and test it against a scholarly source.`
]
},

"logic|politics": {
brief: `Social choice theory is where logic meets politics and delivers unwelcome news. Arrow proved no aggregation rule can satisfy universality, unanimity, independence of irrelevant alternatives and non-dictatorship together. Condorcet had already found that majority preferences can cycle — A beats B, B beats C, C beats A — so "what the majority wants" may not exist as a coherent object. This is not an argument against democracy but it is a hard limit on claims about the will of the people.`,
developments: [
`Condorcet's paradox (1785) showed majority preference can be intransitive, two centuries before Arrow generalised the problem.`,
`Arrow's theorem (1951) established the impossibility result that founded modern social choice theory.`,
`Approval voting, ranked choice and quadratic voting are all attempts to escape the constraints by weakening one of Arrow's conditions.`
],
relevance: [
`Political rhetoric is a fallacy museum: false dilemmas, motte-and-bailey, and the strategic ambiguity that makes a claim unfalsifiable.`,
`May's theorem shows majority rule is uniquely characterised for two options — the trouble only starts at three.`
],
projects: [
`Construct a Condorcet cycle from real preference data and present it clearly.`,
`Run one election's ballots through four voting systems and report how the winner changes.`,
`Analyse a political speech for motte-and-bailey structure with quoted passages.`,
`Write on which of Arrow's conditions you would sacrifice, and what it costs.`,
`Design a voting method for a real decision in your school or club and defend its properties.`
]
},

"debate|politics": {
brief: `Competitive debate and actual politics reward opposite things, which is worth knowing before you confuse the two. A debate is judged on argument quality by someone paid to be impartial; an election is decided by people who mostly are not listening. That gap explains why the most persuasive political communication is repetition and framing rather than reasoning — Lakoff's point about frames is that facts which do not fit an existing frame are simply not absorbed.`,
developments: [
`The Lincoln–Douglas debates of 1858 remain the benchmark for sustained public argument, at a length no modern format permits.`,
`Televised debates from 1960 onward shifted the medium's bias towards appearance and composure, which is a measurable effect.`,
`India's parliamentary question hour and its declining sitting days are a live case study in the erosion of deliberative institutions.`
],
relevance: [
`Overton window shifts explain why a position considered unspeakable can become mainstream in a decade, without anyone being persuaded of anything.`,
`Motivated reasoning means the better argument frequently loses, and pretending otherwise is a strategic error.`
],
projects: [
`Analyse two political speeches for framing and count how often each frame is reinforced.`,
`Compare Lok Sabha sitting days and bills passed without discussion over three decades.`,
`Track one policy position's movement through the Overton window with dated evidence.`,
`Rewrite a strong technical argument for a general audience without losing its content.`,
`Study whether debate performance correlates with electoral outcome in any measurable way.`
]
},

"art|politics": {
brief: `Every state that has felt insecure has taken an interest in art, and the interventions are legible. Socialist realism prescribed content; the CIA quietly promoted abstract expressionism as evidence of Western freedom; the Films Division in India produced documentaries that had to be screened before every commercial film. Censorship is the crude instrument. Patronage is the effective one, because deciding who gets funded shapes what gets made without anyone having to ban anything.`,
developments: [
`Socialist realism was formalised as Soviet state doctrine in 1934, making aesthetic deviation a political offence.`,
`The CIA's covert promotion of abstract expressionism through the Congress for Cultural Freedom was documented decades later by Frances Stonor Saunders.`,
`India's CBFC certification and its litigation history — from <em>Bandit Queen</em> to more recent cases — maps the practical boundaries of Article 19(1)(a).`
],
relevance: [
`Protest art from the Progressive Artists' Group onward is a strand of Indian political history that art history books cover better than political ones.`,
`Public monuments are political claims in stone, and fights over them are fights over official memory.`
],
projects: [
`Study three CBFC decisions and assess them against the Article 19(2) restrictions.`,
`Compare state-funded and independently funded work on the same subject.`,
`Research the Congress for Cultural Freedom's Indian activities specifically.`,
`Analyse a public monument's commissioning history and what it was meant to assert.`,
`Write on whether state arts funding can avoid shaping content.`
]
},

"debate|logic": {
brief: `Formal logic tells you when an argument is valid; debate is won on soundness, relevance and burden. The most useful transfer is the fallacy vocabulary, but used precisely — calling something a straw man only works if you can state the original position and show the difference. Toulmin's model beats the syllogism here because real arguments have warrants that are usually left unstated, and the fastest way to break a case is to surface its warrant and attack that instead of its conclusion.`,
developments: [
`Toulmin's model (1958) was designed for arguments that do not fit deductive form, which is nearly all of them.`,
`Walton's work on argumentation schemes catalogued the recurring patterns with their critical questions, which is more useful in a round than a fallacy list.`,
`Bayesian argumentation treats evidence as shifting probability rather than proving conclusions, which matches how good judges actually think.`
],
relevance: [
`Fallacies are not automatic disqualifiers — an appeal to authority can be perfectly reasonable if the authority is relevant and the claim is within their domain.`,
`Necessary versus sufficient conditions is the distinction that quietly decides more rounds than any named fallacy.`
],
projects: [
`Map a full case onto Toulmin's model and attack it at the warrant.`,
`Build a set of argumentation schemes with the critical questions for each, drawn from your own motions.`,
`Take ten fallacy accusations from real debates and check whether each was correctly applied.`,
`Rewrite a case as a Bayesian argument, stating priors and how each piece of evidence updates them.`,
`Run a drill where the only permitted rebuttal is identifying an unstated premise.`
]
},

"art|logic": {
brief: `Constraint is a generative device, and the strongest demonstrations are formal. The Oulipo group wrote under mathematical restrictions — Perec's <em>La Disparition</em> is a novel without the letter e, translated into English with the same constraint intact. Bach's canons are transformation rules applied to a subject. Escher's impossible objects are visual contradictions that are locally consistent and globally impossible, which is exactly the structure of a paradox and why Hofstadter built a whole book on the parallel.`,
developments: [
`Oulipo, founded in 1960, treated formal constraint as the engine of literary invention rather than an obstacle to it.`,
`Hofstadter's <em>Gödel, Escher, Bach</em> (1979) drew the parallel between self-reference in logic, art and music, and won a Pulitzer for it.`,
`Conceptual art from the 1960s made the proposition itself the work, which forces the question of whether an artwork can be a valid or invalid argument.`
],
relevance: [
`Visual paradoxes such as the Penrose triangle are locally coherent and globally contradictory — a precise structural analogy to the liar sentence.`,
`Sonnet form, raga grammar and sonata form are all rule systems that permit infinite generation within finite constraints.`
],
projects: [
`Write a piece under a strict Oulipian constraint and record what the constraint forced you to discover.`,
`Construct an impossible figure and explain precisely where local consistency fails globally.`,
`Analyse a Bach canon as a set of formal transformation rules and generate a new one.`,
`Compare raga grammar with generative rules in formal language theory.`,
`Build a generative poetry system with explicit rules and judge whether the output is yours.`
]
},

"art|debate": {
brief: `Rhetoric was one of the seven liberal arts before it became a pejorative, and the classical division still holds: ethos, pathos, logos. Debaters are trained to distrust pathos, which is a mistake — the strongest cases pair a rigorous mechanism with a concrete image, because an audience remembers the image and uses it to hold the mechanism. Delivery is a craft with its own technique: pacing, silence, emphasis, and the deliberate use of a single sentence that sounds different from every other sentence in the speech.`,
developments: [
`Aristotle's <em>Rhetoric</em> established the three appeals and the theory of the enthymeme, which is a syllogism with a premise the audience supplies themselves.`,
`Cicero's five canons — invention, arrangement, style, memory, delivery — remain the best available checklist for preparing a speech.`,
`The Natyashastra's treatment of abhinaya and rasa is a fully developed performance theory that debaters never read and probably should.`
],
relevance: [
`Metaphor is not decoration: Lakoff and Johnson argue it structures thought, so the metaphor you choose determines which inferences your audience finds natural.`,
`Storytelling beats statistics for retention, which is a fact about audiences that you can either exploit or be beaten by.`
],
projects: [
`Rewrite one of your own speeches applying Cicero's five canons explicitly.`,
`Collect ten metaphors used in a policy debate and analyse which inferences each licenses.`,
`Study a performance from any tradition and extract three delivery techniques you can use.`,
`Build the same argument twice, once as pure mechanism and once anchored by a single image, and test both on listeners.`,
`Write on whether emotional appeal is legitimate persuasion or manipulation, and where the line sits.`
]
}

};

/* Both orderings of a key resolve to the same dossier. */
Object.keys(CONNECTIONS).forEach(k => {
  const [a, b] = k.split('|');
  const sorted = [a, b].sort().join('|');
  if (sorted !== k) CONNECTIONS[sorted] = CONNECTIONS[k];
});
