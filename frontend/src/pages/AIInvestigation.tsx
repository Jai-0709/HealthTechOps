import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { SeverityBadge, StatusBadge, Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../lib/utils'
import { Bot, AlertCircle, CheckCircle, Loader, XCircle, ShieldCheck, Terminal, Sparkles, Cpu, Layers } from 'lucide-react'
import { toast } from 'sonner'

export function AIInvestigation() {
  const [searchParams] = useSearchParams()
  const preselect = searchParams.get('incident_id')
  const [selectedId, setSelectedId] = useState(preselect || '')
  const [invId, setInvId] = useState('')

  const { data: incidents } = useQuery({
    queryKey: ['incidents-open'],
    queryFn: () => api.get<any[]>('/incidents?limit=20'),
    refetchInterval: 30000,
  })

  const { data: aiStatus } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => api.get<any>('/ai/status'),
    refetchInterval: 60000,
  })

  const { data: investigation } = useQuery({
    queryKey: ['investigation', invId],
    queryFn: () => api.get<any>(`/ai/investigate/${invId}`),
    enabled: !!invId,
    refetchInterval: (q) => (q.state.data?.status === 'RUNNING' ? 3000 : false),
  })

  const investigate = useMutation({
    mutationFn: () => api.post<any>('/ai/investigate', { incident_id: selectedId }),
    onSuccess: (data) => {
      setInvId(data.investigation_id)
      toast.success('Autonomous AI investigation started')
    },
    onError: (e: any) => toast.error(e.message || 'Investigation trigger failed'),
  })

  const queueRemediation = useMutation({
    mutationFn: (actionName: string) =>
      api.post<any>('/remediation/request', {
        action_name: actionName,
        incident_id: selectedId,
        risk_level: 'MEDIUM',
      }),
    onSuccess: (res: any) => {
      toast.success(`Action '${res.action_name}' queued for human review in Automation queue`)
    },
    onError: (e: any) => toast.error(e.message || 'Failed to queue remediation'),
  })

  const selected = incidents?.find((i) => i.id === selectedId)

  useEffect(() => {
    if (!selectedId && incidents && incidents.length > 0) {
      setSelectedId(incidents[0].id)
    }
  }, [incidents, selectedId])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--primary)] mb-1">
            Autonomous Incident Operations · Local LLM Engine
          </div>
          <h1
            className="text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            AI Investigation &amp; Triage
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Automated root-cause analysis, log synthesis, and allowlist-guarded remediation recommendations powered by Ollama (<code className="font-mono text-xs">llama3.2</code>).
          </p>
        </div>

        {/* Model Status Pill */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-medium ${
            aiStatus?.available
              ? 'bg-[#5db872]/10 border-[#5db872]/30 text-[#2e7d32] dark:text-[#81c784]'
              : 'bg-[#e8a55a]/15 border-[#e8a55a]/30 text-[#b25e00] dark:text-[#ffb74d]'
          }`}
        >
          {aiStatus?.available ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#5db872] animate-pulse" />
              <span>Ollama Online · {aiStatus.configured_model}</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              <span>Ollama Offline (localhost:11434)</span>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Incident Selector (Left) + Dark Obsidian AI Terminal (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incident Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-medium text-[var(--muted)]">
              Active Incident Queue
            </span>
            <span className="text-xs font-mono text-[var(--muted)]">
              {incidents?.length ?? 0} available
            </span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {!incidents?.length ? (
              <div className="p-8 text-center text-sm text-[var(--muted)] border border-[var(--hairline)] rounded-xl bg-[var(--surface-soft)]">
                Zero incidents in queue
              </div>
            ) : (
              incidents.map((i) => {
                const isCurrent = selectedId === i.id
                return (
                  <button
                    key={i.id}
                    onClick={() => {
                      setSelectedId(i.id)
                      setInvId('')
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                      isCurrent
                        ? 'border-[var(--primary)] bg-[var(--surface-card)] shadow-xs ring-1 ring-[var(--primary)]/20'
                        : 'border-[var(--hairline)] bg-[var(--surface-soft)] hover:border-[var(--muted-soft)] hover:bg-[var(--surface-card)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <SeverityBadge severity={i.severity} />
                        <StatusBadge status={i.status} />
                      </div>
                      <span className="text-[11px] font-mono text-[var(--muted)]">
                        {formatDate(i.detected_at)}
                      </span>
                    </div>

                    <h3 className="text-sm font-medium text-[var(--ink)] leading-snug">
                      {i.title}
                    </h3>

                    {i.service_name && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mt-1.5 font-mono">
                        <span>svc:</span>
                        <span className="text-[var(--body)]">{i.service_name}</span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right: AI Diagnostic Terminal (7 cols) */}
        <div className="lg:col-span-7">
          {!selectedId ? (
            <div className="h-[460px] flex items-center justify-center border border-[var(--hairline)] rounded-xl bg-[var(--surface-soft)] p-8">
              <EmptyState
                icon={<Bot size={44} className="text-[var(--primary)] opacity-80" />}
                title="Select an Incident to Investigate"
                description="Select any active microservice incident from the queue to trigger local Ollama llama3.2 root-cause diagnostic synthesis."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Incident Header Card */}
              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-mono text-[var(--primary)] uppercase tracking-wide">
                      Target Incident
                    </div>
                    <h2 className="text-lg font-medium text-[var(--ink)] mt-0.5 leading-snug">
                      {selected?.title || 'Selected Incident'}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      {selected && <SeverityBadge severity={selected.severity} />}
                      {selected && <StatusBadge status={selected.status} />}
                      {selected?.service_name && (
                        <span className="text-xs font-mono text-[var(--muted)]">
                          svc: {selected.service_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    loading={investigate.isPending || investigation?.status === 'RUNNING'}
                    onClick={() => investigate.mutate()}
                    disabled={!aiStatus?.available}
                    size="md"
                    className="flex-shrink-0"
                  >
                    <Sparkles size={15} />
                    <span>
                      {investigation?.status === 'RUNNING'
                        ? 'Synthesizing...'
                        : 'Run AI Diagnostics'}
                    </span>
                  </Button>
                </div>
              </Card>

              {/* Signature Dark Obsidian Product Mockup Card */}
              {investigation ? (
                <div className="bg-[#181715] text-[#faf9f5] border border-[#2e2b27] rounded-xl p-6 shadow-md space-y-6">
                  {/* Terminal Header Chrome */}
                  <div className="flex items-center justify-between border-b border-[#2e2b27] pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#c64545]/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-[#e8a55a]/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-[#5db872]/80 inline-block" />
                      </div>
                      <div className="ml-3 flex items-center gap-2 text-xs font-mono text-[#a09d96]">
                        <Terminal size={14} className="text-[#cc785c]" />
                        <span>ollama-engine :: {investigation.model_name || 'llama3.2'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {investigation.status === 'RUNNING' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#cc785c]/20 text-[#cc785c] border border-[#cc785c]/40">
                          <Loader size={12} className="animate-spin" />
                          <span>REASONING</span>
                        </span>
                      )}
                      {investigation.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#5db872]/20 text-[#81c784] border border-[#5db872]/40">
                          <CheckCircle size={12} />
                          <span>SYNTHESIS COMPLETE</span>
                        </span>
                      )}
                      {investigation.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#c64545]/20 text-[#ef5350] border border-[#c64545]/40">
                          <XCircle size={12} />
                          <span>INFERENCE FAILED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Loading State */}
                  {investigation.status === 'RUNNING' && (
                    <div className="py-16 text-center space-y-3">
                      <Loader size={36} className="animate-spin mx-auto text-[#cc785c]" />
                      <p className="text-sm font-medium text-[#faf9f5]">
                        Executing chain-of-thought analysis across logs &amp; telemetry...
                      </p>
                      <p className="text-xs font-mono text-[#a09d96]">
                        Extracting root-cause hypotheses via local llama3.2 (synthetic environment)
                      </p>
                    </div>
                  )}

                  {/* Completed Investigation Results */}
                  {investigation.status === 'COMPLETED' && (
                    <div className="space-y-6">
                      {/* Confidence Score Bar */}
                      <div className="flex items-center justify-between p-3.5 bg-[#1f1e1b] rounded-lg border border-[#2e2b27]">
                        <div className="flex items-center gap-2">
                          <Cpu size={16} className="text-[#cc785c]" />
                          <span className="text-xs font-mono text-[#a09d96] uppercase">
                            Model Confidence Score
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-[#252320] rounded-full overflow-hidden border border-[#2e2b27]">
                            <div
                              className="h-full bg-[#cc785c] rounded-full transition-all duration-700"
                              style={{ width: `${(investigation.confidence_score ?? 0.85) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-[#faf9f5]">
                            {((investigation.confidence_score ?? 0.85) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Root Cause Summary */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#cc785c] mb-2 font-medium">
                          <span>▸ Root Cause Diagnosis</span>
                        </div>
                        <div className="p-4 bg-[#1f1e1b] border border-[#2e2b27] rounded-lg text-sm text-[#faf9f5] leading-relaxed font-sans">
                          {investigation.root_cause_summary}
                        </div>
                      </div>

                      {/* Evidence Items */}
                      {investigation.evidence_items?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#a09d96] mb-2 font-medium">
                            <Layers size={13} className="text-[#cc785c]" />
                            <span>Telemetry Evidence &amp; Corroborating Signals</span>
                          </div>
                          <div className="p-3 bg-[#1f1e1b] border border-[#2e2b27] rounded-lg space-y-2">
                            {investigation.evidence_items.map((e: string, i: number) => (
                              <div
                                key={i}
                                className="text-xs font-mono text-[#d1cec7] flex items-start gap-2.5 leading-relaxed"
                              >
                                <span className="text-[#cc785c] select-none font-bold">›</span>
                                <span>{e}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Actions Guarded by Allowlist */}
                      {investigation.recommended_actions?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#5db8a6] mb-2 font-medium">
                            <ShieldCheck size={14} className="text-[#5db8a6]" />
                            <span>Recommended Remediation (Allowlist-Guarded)</span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {investigation.recommended_actions.map((act: string) => (
                              <div
                                key={act}
                                className="px-3 py-1.5 rounded-lg bg-[#252320] text-[#faf9f5] border border-[#5db8a6]/40 font-mono text-xs flex items-center gap-3"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#5db8a6]" />
                                  <code>{act}</code>
                                </div>
                                <button
                                  type="button"
                                  disabled={queueRemediation.isPending}
                                  onClick={() => queueRemediation.mutate(act)}
                                  className="px-2 py-0.5 rounded bg-[#cc785c] text-white hover:bg-[#a9583e] text-[10px] font-sans font-medium transition-colors cursor-pointer"
                                  title="Queue remediation for human approval in Automation"
                                >
                                  Queue for Review →
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata Footer */}
                      <div className="pt-4 border-t border-[#2e2b27] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#a09d96]">
                        <span>ID: {investigation.id}</span>
                        <span>Completed: {formatDate(investigation.completed_at)}</span>
                      </div>
                    </div>
                  )}

                  {/* Failed State */}
                  {investigation.status === 'FAILED' && (
                    <div className="py-10 text-center space-y-2">
                      <XCircle size={32} className="mx-auto text-[#c64545]" />
                      <p className="text-sm font-medium text-[#faf9f5]">Investigation Execution Failed</p>
                      <p className="text-xs font-mono text-[#a09d96]">
                        Verify Ollama is running: <code className="bg-[#252320] px-1 py-0.5 rounded text-[#faf9f5]">ollama serve</code>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Pre-run state: Prompt user to trigger diagnosis */
                <div className="p-8 border border-dashed border-[var(--hairline)] rounded-xl bg-[var(--surface-soft)] text-center space-y-2">
                  <Bot size={32} className="mx-auto text-[var(--muted)]" />
                  <p className="text-sm font-medium text-[var(--ink)]">
                    Ready to Analyze Incident #{selected.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
                    Click &ldquo;Run AI Diagnostics&rdquo; to send the incident payload and telemetry logs to local Ollama.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
