type ErrorStateProps = {
    message?: string
}

export const ErrorState = ({message = "Не удалось загрузить данные"}: ErrorStateProps) => {
    return (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200">
            {message}
        </div>
    )
}