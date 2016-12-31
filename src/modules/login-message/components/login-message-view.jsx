import React, { PropTypes } from 'react';
import Link from 'modules/link/components/link';

const LoginMessagePage = p => (
	<section id="login_message_view" >
		<div className="page-content">
			<h1>{`Welcome to the Augur beta test!`}</h1>
			<p>{`This is a beta test in advance of Augur's live release. There are bugs. There are features being
				added, improved, and re-designed. There are a few hundred enhancements scheduled to be added in the next few
				months. Your thoughtful feedback now is essential. Please use the feedback button at the bottom left of
				every page to submit your feedback, or feel free to send an email to `}
				<a
					className="link"
					href="mailto:hugs@augur.net?subject=Beta Testing feedback"
				>
					{'hugs@augur.net'}
				</a>
				{`. From your submissions, the development team will coordinate fixes and new features. Changes and fixes will be
				displayed when you log in again.`}
			</p>
			<h2>Important information:</h2>
			<ol>
				<li>
					Because Augur is a <b>completely decentralized</b> system, if you lose your login credentials it
					is impossible to recover them. Please <a className="link" href="http://blog.augur.net/faq/how-do-i-savebackup-my-wallet/" target="_blank" rel="noopener noreferrer">take
					appropriate measures</a> to protect the safety of your password, and create a way to
					recover your credentials if you forget them.
				</li>
				<li>
					Do not send real Ether (ETH) to your Augur account while we are testing! Each account will be given
					10,000 testnet ETH tokens for beta testing. Please note that testnet ETH has no value except for testing:
					it is merely an on-contract IOU (a token) for testnet Ether.
				</li>
				<li>
					{`Reputation (REP) is a unique and important part of the Augur trading platform. If you own REP tokens, you must visit
					the site periodically to fulfill your reporting obligations. During beta testing, each new account will
					receive 47 testnet REP (they have no value except for testing). Each reporting cycle will last 2 days. Every
					two-day cycle will consist of a commit phase, a reveal phase, and a challenge phase. Because the test
					cycle is dramatically compressed (the main net cycle will be 60 days long) it is recommended that
					users visit the site at least every 2 days to maintain your REP and simulate “real money” trading,
					resolution, and reporting conditions. Learn `}
					<a
						className="link"
						href="https://www.youtube.com/watch?v=sCms-snzHk4"
						target="_blank"
						rel="noopener noreferrer"
					>
						{`how Augur's Reputation tokens work`}
					</a>.
				</li>
				<li>
					{`A note on price/time priority on the blockchain.  The site is only as fast as Ethereum blocks are mined.  Augur's matching engine sorts order books by price, then by block number, then by transaction index. Within a single block, transactions are ordered by the miner who mines the block.  When constructing a block, miners typically order transactions first by gasprice (highest to lowest), and then by the order received (oldest to newest).  So, Augur's "price/blocknumber/transaction index priority" ordering is generally equivalent to price/time priority, if there are differing gasprices within the block, the transaction index is not guaranteed to be time-ordered.  (Presently, Augur does not attempt to adjust gasprices in response to other pending transactions, although, if desired, gasprice can be adjusted manually using the API, by changing the "gasPrice" field attached to every sendTransaction payload.)`}
				</li>
			</ol>
			<h2>Technical updates:</h2>
			<h3>December 31, 2016</h3>
			<ol>
				<li>
				    Indeterminate reports are now correctly converted to hexadecimal strings in augur.js fixReport method.
				</li>
				<li>
					Converted main trade logged-transaction loop to async.forEachOfSeries for proper getMarketInfo callback closure.
				</li>
				<li>
					Added initial check if &quot;from&quot; field matches login account address before processing relayed transactions.
				</li>
				<li>
				    Fixed a reassignment error in place-trade.
				</li>
			</ol>
			<h3>December 30, 2016</h3>
			<ol>
				<li>
					Moved collectFees logic to augur.js: fee collection now handled automatically by augur.checkPeriod.
				</li>
				<li>
					The UI sync-branch-with-blockchain logic now looks up the last report cycle penalized and and the fee collection status of the cycle prior to the cycle being checked for penalties.  Both of these fields are now attached to the branch data store and available in the front-end.
				</li>
				<li>
					Filled in switch cases for submitReport, submitReportHash, penalizeWrong, and penalizationCatchup in the front-end part of the transaction relayer.
				</li>
			</ol>
			<h3>December 28, 2016</h3>
			<ol>
				<li>
					Fixed/updated all downstream actions from or calling to bid, ask, and short ask.
				</li>
			</ol>
			<h3>December 28, 2016</h3>
			<ol>
				<li>
					Replaced deprecated bid, ask, and short ask transaction-related code with simple calls to augur.js.  All transaction display updating and messaging is now handled automatically by the transation relay and filters.
				</li>
				<li>
					Added possible events that can be logged by a method call to API maker script.
				</li>
				<li>
					Added error / null return checks to load-then-retry-conversion callbacks.
				</li>
				<li>
					Refactored trading log-to-transaction conversions.
				</li>
			</ol>
			{p.marketsLink &&
				<Link className="lets-do-this-button" {...p.marketsLink} >{`Let's do this!`}</Link>
			}
		</div>
	</section>
);

LoginMessagePage.propTypes = {
	marketsLink: PropTypes.object // TODO
};

export default LoginMessagePage;
