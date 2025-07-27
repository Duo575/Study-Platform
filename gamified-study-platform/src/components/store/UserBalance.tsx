import React from 'react';
import { UserEconomy } from '../../types';

interface UserBalanceProps {
  economy: UserEconomy;
  className?: string;
}

export const UserBalance: React.FC<UserBalanceProps> = ({
  economy,
  className = '',
}) => {
  return (
    <div className={`user-balance ${className}`}>
      <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
        <div className="balance-item flex items-center gap-2">
          <span className="text-lg">🪙</span>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">
              {economy.coins.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">Coins</span>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-200"></div>

        <div className="balance-item flex items-center gap-2">
          <span className="text-lg">💎</span>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">
              {economy.premiumCoins.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">Premium</span>
          </div>
        </div>

        {/* Daily Limit Indicator */}
        {economy.dailyCoinLimit > 0 && (
          <>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="daily-progress flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">
                  {economy.dailyCoinsEarned}/{economy.dailyCoinLimit}
                </span>
                <span className="text-xs text-gray-500">daily</span>
              </div>
              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (economy.dailyCoinsEarned / economy.dailyCoinLimit) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
