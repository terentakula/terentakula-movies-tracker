import { EmptyState } from "../../../shared/ui/EmptyState"
import type { LibraryItem } from "../types/userLibrary.types"
import { LibraryCard } from "./LibraryCard"

type LibraryGridProps = { 
    items: LibraryItem[]
    emptyTitle: string
    emptyDescription: string
    onRemove?: (item: LibraryItem) => void
}

export const LibraryGrid = ( {
    items, emptyTitle,emptyDescription,onRemove
}: LibraryGridProps) => {
    if(!items.length) {
        return <EmptyState title={emptyTitle} description={emptyDescription} />
    }

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
                <LibraryCard
                    key={`${item.mediaType}-${item.id}`}
                    item={item}
                    onRemove={onRemove ? () => onRemove(item) : undefined}
                />
            ))}
        </div>
    )
}