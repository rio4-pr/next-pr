export interface NewsPayload {
    category_id: number
    source_id?: number

    news_title: string
    news_summary?: string
    news_url?: string

    news_date: string

    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'

    is_highlighted: boolean

    created_by?: number
}
