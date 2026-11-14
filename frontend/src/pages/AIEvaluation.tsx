import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { MetricCard } from '../components/ui/MetricCard'
import { EmptyState } from '../components/ui/EmptyState'
import { FlaskConical, Play, CheckCircle, BarChart2, ShieldCheck, Cpu } from 'lucide-react'
import { toast } from 'sonner'

interface TestCase {
  id: string
  name: string
  description?: string
  expected_root_cause: string
  expected_actions?: string[]
  synthetic_incident?: {
    severity?: string
    evidence?: Record<string, any>
    [key: string]: any
  }
}

interface EvalRun {
  id: number | string
  model_name: string
  total_cases: number
  correct_root_causes: number
  avg_evidence_score: number
  unsafe_action_count?: number
  started_at: string
  completed_at?: string | null
  results?: any[]
}

export function AIEvaluation() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [runningId, setRunningId] = useState<string | null>(null)
  const canRun = user?.role === 'ADMIN' || user?.role === 'SRE_ENGINEER'

  const { data: testCases = [], isLoading: casesLoading } = useQuery<TestCase[]>({
    queryKey: ['eval-cases'],
    queryFn: () => api.get<TestCase[]>('/evaluation/test-cases'),
  })

  const { data: rawRuns = [], isLoading: runsLoading } = useQuery<EvalRun[]>({
    queryKey: ['eval-runs'],
    queryFn: () => api.get<EvalRun[]>('/evaluation/runs'),
    refetchInterval: runningId ? 4000 : false,
    select: (data) => {
      const running = data.find((r) => !r.completed_at)
      if (!running && runningId) setRunningId(null)
      return data
    },
  })

  const runs = rawRuns.map((r) => {
    const isCompleted = !!r.completed_at
    const status: 'completed' | 'running' = isCompleted ? 'completed' : 'running'
    const accuracyPct = r.total_cases > 0 ? (r.correct_root_causes / r.total_cases) * 100 : 0
    return {
      ...r,
      status,
      accuracyPct,
    }
  })

  const runMutation = useMutation({
    mutationFn: () => api.post<{ run_id: number; status: string }>('/evaluation/run', {}),
    onSuccess: (data) => {
      toast.success('Evaluation benchmark suite initiated')
      setRunningId(String(data.run_id))
      qc.invalidateQueries({ queryKey: ['eval-runs'] })
    },
    onError: () => toast.error('Failed to trigger evaluation run'),
  })

  const latestRun = runs[0]
  const completedRuns = runs.filter((r) => r.status === 'completed')
  const avgAccuracy =
    completedRuns.length > 0
      ? completedRuns.reduce((s, r) => s + r.accuracyPct, 0) / completedRuns.length
      : null

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--primary)] mb-1">
            Responsible AI · Diagnostic Accuracy Benchmark
          </div>
          <h1
            className="text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            AI Model Evaluation
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Systematic accuracy, precision, and hallucination evaluation of local Ollama models on synthetic incident benchmarks.
          </p>
        </div>

        {canRun ? (
          <Button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending || !!runningId}
            size="md"
          >
            <Play size={14} />
            <span>{runMutation.isPending || runningId ? 'Evaluating...' : 'Run Benchmark'}</span>
          </Button>
        ) : (
          <div className="text-xs font-mono text-[var(--muted)] px-3 py-1.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--hairline)]">
            ADMIN or SRE_ENGINEER required to run benchmark
          </div>
        )}
      </div>

      {runningId && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping flex-shrink-0" />
          <span>
            <strong>Benchmark in progress:</strong> Executing local Ollama inference against {testCases.length} synthetic scenarios...
          </span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Benchmark Scenarios"
          value={casesLoading ? '—' : String(testCases.length)}
          unit="scenarios"
          icon={<FlaskConical size={18} />}
          status="neutral"
        />
        <MetricCard
          title="Evaluation Runs"
          value={runsLoading ? '—' : String(runs.length)}
          unit="runs"
          icon={<BarChart2 size={18} />}
          status="neutral"
        />
        <MetricCard
          title="Latest Accuracy"
          value={latestRun ? `${latestRun.accuracyPct.toFixed(1)}` : '—'}
          unit="%"
          icon={<CheckCircle size={18} />}
          status={latestRun ? (latestRun.accuracyPct >= 70 ? 'healthy' : 'warning') : 'neutral'}
          trendValue={latestRun ? `Model: ${latestRun.model_name}` : 'No runs yet'}
        />
        <MetricCard
          title="Portfolio Avg Accuracy"
          value={avgAccuracy != null ? `${avgAccuracy.toFixed(1)}` : '—'}
          unit="%"
          icon={<Cpu size={18} />}
          status={avgAccuracy && avgAccuracy >= 70 ? 'healthy' : 'neutral'}
          trendValue={completedRuns.length > 0 ? `Across ${completedRuns.length} completed runs` : undefined}
        />
      </div>

      {/* Benchmark Test Cases Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Synthetic Incident Benchmark Suite</CardTitle>
            <CardDescription>Curated ground-truth test cases evaluating root cause diagnosis and action filtering</CardDescription>
          </div>
          <span className="text-xs font-mono text-[var(--muted)]">
            {testCases.length} verified test cases
          </span>
        </CardHeader>

        {casesLoading ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">Loading benchmark test cases...</div>
        ) : testCases.length === 0 ? (
          <EmptyState
            icon={<FlaskConical size={40} className="text-[var(--primary)] opacity-80" />}
            title="Zero Test Cases"
            description="Database contains no evaluation scenarios."
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Scenario Name &amp; Description</Th>
                <Th>Ground Truth Root Cause</Th>
                <Th>Allowlisted Expected Action</Th>
                <Th>Incident Severity</Th>
              </Tr>
            </Thead>
            <Tbody>
              {testCases.map((tc) => {
                const sev = tc.synthetic_incident?.severity || 'MEDIUM'
                return (
                  <Tr key={tc.id}>
                    <Td>
                      <div className="font-medium text-[var(--ink)] leading-snug">{tc.name}</div>
                      {tc.description && (
                        <div className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                          {tc.description}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <div className="text-xs text-[var(--body)] font-sans max-w-sm">
                        {tc.expected_root_cause}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {tc.expected_actions && tc.expected_actions.length > 0 ? (
                          tc.expected_actions.map((act) => (
                            <code
                              key={act}
                              className="text-[11px] font-mono bg-[var(--surface-soft)] text-[var(--primary)] px-2 py-0.5 rounded border border-[var(--hairline)]"
                            >
                              {act}
                            </code>
                          ))
                        ) : (
                          <span className="text-xs text-[var(--muted)]">—</span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <Badge
                        variant={
                          sev === 'CRITICAL' ? 'danger' : sev === 'HIGH' ? 'warning' : 'info'
                        }
                      >
                        {sev}
                      </Badge>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        )}
      </Card>

      {/* Evaluation Run History */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Historical Benchmark Runs</CardTitle>
            <CardDescription>Performance track record of local models over time</CardDescription>
          </div>
          <span className="text-xs font-mono text-[var(--muted)]">
            {runs.length} runs recorded
          </span>
        </CardHeader>

        {runsLoading ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">Loading historical runs...</div>
        ) : runs.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={<BarChart2 size={40} className="text-[var(--primary)] opacity-80" />}
              title="No Evaluation Runs Yet"
              description="Click 'Run Benchmark' above to evaluate the local Ollama model against the test suite."
            />
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Target Model</Th>
                <Th>Status</Th>
                <Th>Test Cases</Th>
                <Th>Correct Causes</Th>
                <Th>Accuracy Rate</Th>
                <Th>Evidence Score</Th>
                <Th>Timestamp</Th>
              </Tr>
            </Thead>
            <Tbody>
              {runs.map((run) => (
                <Tr key={run.id}>
                  <Td>
                    <code className="text-xs font-mono bg-[var(--surface-soft)] px-2 py-0.5 rounded text-[var(--ink)]">
                      {run.model_name}
                    </code>
                  </Td>
                  <Td>
                    <Badge variant={run.status === 'completed' ? 'success' : 'warning'}>
                      {run.status.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td className="font-mono text-xs">{run.total_cases}</Td>
                  <Td className="font-mono text-xs font-semibold">
                    {run.status === 'completed' ? run.correct_root_causes : '—'}
                  </Td>
                  <Td>
                    {run.status === 'completed' ? (
                      <span
                        className={`font-mono text-xs font-semibold ${
                          run.accuracyPct >= 70 ? 'text-[#5db872]' : 'text-[#c64545]'
                        }`}
                      >
                        {run.accuracyPct.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">—</span>
                    )}
                  </Td>
                  <Td className="font-mono text-xs text-[var(--muted)]">
                    {run.status === 'completed' ? run.avg_evidence_score?.toFixed(2) : '—'}
                  </Td>
                  <Td className="font-mono text-xs text-[var(--muted)]">
                    {new Date(run.started_at).toLocaleString()}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
