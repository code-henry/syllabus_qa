export type Citation = { section?: string | null; page_from?: number | null; page_to?: number | null };

export class OpenAIClient {
  async askWithCitations(input: { question: string; context?: { year?: number; courseCode?: string } }) {
    // TODO: Implement real Assistants API call with file_search + vector store.
    // For now, return a deterministic placeholder to allow end-to-end wiring and tests.
    const answerMd = `【要点】\n- サンプル回答（スタブ）\n\n【詳細】\n…\n\n【引用】履修の手引き p.XX–YY\n【備考】本サービスの回答は非公式の参考情報です。原本をご確認ください。`;
    const citations: Citation[] = [{ section: '履修の手引き', page_from: 1, page_to: 2 }];
    return { answerMd, citations };
  }
}
