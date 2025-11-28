'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { RarityBadge } from '@/components/ui/badge'
import { CoinsIcon, GemIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

interface ItemCardProps {
  item: {
    id: string
    name: string
    description: string
    icon: string
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
    type: string
    buyPrice?: number | null
    gemPrice?: number | null
    quantity?: number
  }
  mode?: 'shop' | 'inventory'
  onPurchase?: (itemId: string) => void
  onUse?: (itemId: string) => void
  onEquip?: (itemId: string) => void
  isEquipped?: boolean
  className?: string
}

export function ItemCard({
  item,
  mode = 'shop',
  onPurchase,
  onUse,
  onEquip,
  isEquipped = false,
  className,
}: ItemCardProps) {
  const rarityColors = {
    COMMON: 'border-gray-300 dark:border-gray-600',
    UNCOMMON: 'border-green-400 dark:border-green-600',
    RARE: 'border-blue-400 dark:border-blue-600',
    EPIC: 'border-purple-400 dark:border-purple-600',
    LEGENDARY: 'border-yellow-400 dark:border-yellow-600',
  }

  return (
    <Card
      variant="bordered"
      className={cn(
        'transition-all hover:shadow-md',
        rarityColors[item.rarity],
        isEquipped && 'ring-2 ring-indigo-500',
        className,
      )}
    >
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{item.icon}</span>
              <RarityBadge rarity={item.rarity} size="sm" />
              {mode === 'inventory' && item.quantity && (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  x{item.quantity}
                </span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {item.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.description}
            </p>
          </div>
        </div>

        {mode === 'shop' && (
          <div className="flex items-center gap-3">
            {item.buyPrice && item.buyPrice > 0 && (
              <div className="flex items-center gap-1">
                <CoinsIcon size={16} />
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.buyPrice}
                </span>
              </div>
            )}
            {item.gemPrice && item.gemPrice > 0 && (
              <div className="flex items-center gap-1">
                <GemIcon size={16} />
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.gemPrice}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {mode === 'shop' && onPurchase && (
        <CardFooter>
          <button
            onClick={() => onPurchase(item.id)}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            구매하기
          </button>
        </CardFooter>
      )}

      {mode === 'inventory' && (
        <CardFooter>
          <div className="w-full flex gap-2">
            {item.type === 'CONSUMABLE' && onUse && (
              <button
                onClick={() => onUse(item.id)}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                사용
              </button>
            )}
            {item.type === 'COSMETIC' && onEquip && (
              <button
                onClick={() => onEquip(item.id)}
                disabled={isEquipped}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
                  isEquipped
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700',
                )}
              >
                {isEquipped ? '장착됨' : '장착'}
              </button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
