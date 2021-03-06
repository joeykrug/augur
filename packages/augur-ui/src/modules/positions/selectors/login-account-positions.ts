import { createSelector } from 'reselect';

import store from 'store';
import { selectAccountPositionsState, selectMarketInfosState } from 'store/select-state';
import { selectMarket } from 'modules/markets/selectors/market';
import { selectMarketPositionsSummary } from 'modules/markets/selectors/select-market-position-summary';
import { selectUserMarketPositions } from 'modules/markets/selectors/select-user-market-positions';

export default function() {
  const markets = selectLoginAccountPositionsMarkets(store.getState());

  const marketsWithPositions = markets.map(market => ({
    ...market,
    userPositions: selectUserMarketPositions(store.getState(), market.id),
    myPositionsSummary: selectMarketPositionsSummary(store.getState(), market.id)
  }));

  return {
    markets: marketsWithPositions,
  };
}

// need to add marketInfos in case positions load before markets
export const selectLoginAccountPositionsMarkets = createSelector(
  selectAccountPositionsState,
  selectMarketInfosState,
  (positions, markets) => {
    return Object.keys(positions)
      .reduce((p, marketId) => {
        if (!Object.keys(markets).includes(marketId)) return p;
        const market = selectMarket(marketId)
        return market ? [...p, market] : p
    }, [])
  }
);
