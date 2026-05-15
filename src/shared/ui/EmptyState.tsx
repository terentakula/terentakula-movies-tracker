
type EmptyStateProps ={
    title: string
    description?: string
}

export const EmptyState = ({ title, description}: EmptyStateProps) => {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-xl font-bold text-white">{title}</h2>

            {description ? (
                <p className="mt-3 text-sm text-slate-400">{description}</p>
            ): null}
        </div>
    )
}