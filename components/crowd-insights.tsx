"use client"

import { useEffect, useState } from "react"
import { getCrowdHistory } from "@/app/actions/crowd"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface CrowdInsightsProps {
  hotspotId: string
}

export function CrowdInsights({ hotspotId }: CrowdInsightsProps) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      const data = await getCrowdHistory(hotspotId)
      if (data) {
        // Transform data for chart
        // We want to show "Average Daily Activity by Hour"
        // Aggregate all days into 24 hours
        const hourlyData = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: 0,
        }))

        data.forEach((item: any) => {
          hourlyData[item.hour_of_day].count += Number(item.activity_level)
        })

        setHistory(hourlyData)
      }
      setLoading(false)
    }
    fetchHistory()
  }, [hotspotId])

  if (loading) {
    return <div className="h-40 w-full animate-pulse bg-muted/20 rounded-lg" />
  }

  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Not enough historical data yet.
      </div>
    )
  }

  const currentHour = new Date().getHours()
  const predictedCount = history[currentHour]?.count || 0
  const nextHourCount = history[(currentHour + 1) % 24]?.count || 0

  let predictionText = "Usually quiet around this time."
  if (predictedCount > 5) predictionText = "Usually busy right now."
  if (nextHourCount > predictedCount * 1.5) predictionText += " Expecting more people soon."
  else if (nextHourCount < predictedCount * 0.5 && predictedCount > 5) predictionText += " Likely to clear out soon."

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Crowd History</h3>
        <span className="text-xs text-muted-foreground bg-secondary/10 px-2 py-1 rounded-full">
           Last 30 Days
        </span>
      </div>

      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history}>
            <XAxis
                dataKey="hour"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}:00`}
                interval={3}
            />
            <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-muted-foreground italic border-l-2 border-primary pl-3 py-1 bg-primary/5 rounded-r">
         {predictionText}
      </div>
    </div>
  )
}
