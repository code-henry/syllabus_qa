"use client"

import { useCallback, useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Citation = {
  section?: string | null
  page_from?: number | null
  page_to?: number | null
  file_id?: string | null
  file_name?: string | null
  quote?: string | null
}

type AskResponse = {
  qaId: string
  answerMd: string
  citations: Citation[]
}

export default function AskPage() {
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AskResponse | null>(null)

  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    []
  )

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!question.trim()) return
      setLoading(true)
      setError(null)
      setResult(null)
      try {
        const res = await fetch(`${apiBase}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        })
        if (!res.ok) {
          let detail = ""
          try {
            const data = await res.json()
            detail = data?.detail || JSON.stringify(data)
          } catch {
            try {
              detail = await res.text()
            } catch {}
          }
          throw new Error(`Request failed: ${res.status}${detail ? " - " + detail : ""}`)
        }
        const data = (await res.json()) as AskResponse
        setResult(data)
      } catch (err: unknown) {
        const message = err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Unknown error"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [apiBase, question]
  )

  const onCancel = useCallback(() => {
    setQuestion("")
    setError(null)
    setResult(null)
  }, [])

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-[720px]">
        <CardHeader>
          <CardTitle>東大シラバスQ&amp;A</CardTitle>
          <CardDescription>
            シラバス（履修の手引き）に関する質問を入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-2">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="question">質問内容</Label>
                <Input
                  id="question"
                  placeholder="例）卒業要件は何単位ですか？"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                クリア
              </Button>
              <Button type="submit" disabled={!question.trim() || loading}>
                {loading ? "送信中..." : "質問する"}
              </Button>
            </div>
          </form>

          {error && (
            <div className="mt-4 text-sm text-red-600">{error}</div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <div>
                <div className="text-sm font-semibold mb-1">回答</div>
                <div className="prose max-w-none prose-sm border rounded-md p-3 bg-muted/30">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result.answerMd}
                  </ReactMarkdown>
                </div>
              </div>
              {result.citations?.length ? (
                <div>
                  <div className="text-sm font-semibold mb-1">引用</div>
                  <ul className="list-disc pl-6 text-sm">
                    {result.citations.map((c, i) => (
                      <li key={i}>
                        {c.file_name || c.section || c.file_id || "Source"}
                        {c.page_from ? (
                          <>
                            {" "}(p.{c.page_from}
                            {c.page_to && c.page_to !== c.page_from ? `–${c.page_to}` : ""})
                          </>
                        ) : null}
                        {c.quote ? (
                          <div className="mt-1 text-xs text-muted-foreground">
                            “{c.quote}”
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  )
}
