"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Users, TrendingUp, MessageSquare, BarChart3, CheckCircle } from "lucide-react"
import SurveyManager from "./survey-manager"

interface AdminStats {
  totalEmployees: number
  avgMoodScore: number
  feedbackCount: number
  surveyParticipation: number
  trainingCompletion: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalEmployees: 25,
    avgMoodScore: 0,
    feedbackCount: 0,
    surveyParticipation: 0,
    trainingCompletion: 0,
  })

  const [moodTrends, setMoodTrends] = useState<any[]>([])
  const [feedbackData, setFeedbackData] = useState<any[]>([])
  const [departmentMoods, setDepartmentMoods] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    // Load all data from localStorage
    const allMoods = JSON.parse(localStorage.getItem("allMoods") || "[]")
    const allFeedbacks = JSON.parse(localStorage.getItem("allFeedbacks") || "[]")
    const completedSurveys = JSON.parse(localStorage.getItem("completedSurveys") || "[]")
    const completedTrainings = JSON.parse(localStorage.getItem("completedTrainings") || "[]")

    // Calculate average mood score
    const avgMood =
      allMoods.length > 0 ? allMoods.reduce((sum: number, mood: any) => sum + mood.value, 0) / allMoods.length : 0

    // Generate mood trends for the last 7 days
    const trends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayMoods = allMoods.filter((mood: any) => {
        const moodDate = new Date(mood.date)
        return moodDate.toDateString() === date.toDateString()
      })

      const dayAvg =
        dayMoods.length > 0 ? dayMoods.reduce((sum: number, mood: any) => sum + mood.value, 0) / dayMoods.length : 0

      trends.push({
        date: date.toLocaleDateString("fr-FR", { weekday: "short" }),
        mood: Math.round(dayAvg * 10) / 10,
        responses: dayMoods.length,
      })
    }

    // Department mood distribution
    const departments = ["IT", "RH", "Marketing", "Ventes", "Finance"]
    const deptMoods = departments.map((dept) => ({
      name: dept,
      mood: Math.round((Math.random() * 2 + 3) * 10) / 10, // Simulate data
      employees: Math.floor(Math.random() * 8) + 3,
    }))

    setStats({
      totalEmployees: 25,
      avgMoodScore: Math.round(avgMood * 10) / 10,
      feedbackCount: allFeedbacks.length,
      surveyParticipation: Math.round((completedSurveys.length / 25) * 100),
      trainingCompletion: Math.round((completedTrainings.length / 25) * 100),
    })

    setMoodTrends(trends)
    setFeedbackData(allFeedbacks.slice(-10)) // Last 10 feedbacks
    setDepartmentMoods(deptMoods)
  }

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Administrateur</h2>
        <p className="text-gray-600">Vue d'ensemble de l'engagement et du bien-être des équipes</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employés Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Humeur Moyenne</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgMoodScore}/5</p>
                <div className="flex items-center mt-1">
                  <Progress value={stats.avgMoodScore * 20} className="w-16 h-2" />
                  <Badge
                    variant={
                      stats.avgMoodScore >= 4 ? "default" : stats.avgMoodScore >= 3 ? "secondary" : "destructive"
                    }
                    className="ml-2 text-xs"
                  >
                    {stats.avgMoodScore >= 4 ? "Excellent" : stats.avgMoodScore >= 3 ? "Bon" : "À améliorer"}
                  </Badge>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Feedbacks Reçus</p>
                <p className="text-2xl font-bold text-gray-900">{stats.feedbackCount}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participation Sondages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.surveyParticipation}%</p>
                <Progress value={stats.surveyParticipation} className="w-16 h-2 mt-1" />
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Formations Évaluées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.trainingCompletion}%</p>
                <Progress value={stats.trainingCompletion} className="w-16 h-2 mt-1" />
              </div>
              <CheckCircle className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendance de l'Humeur (7 derniers jours)</CardTitle>
            <CardDescription>Évolution quotidienne du moral des équipes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Humeur par Département</CardTitle>
            <CardDescription>Comparaison entre les différents services</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentMoods}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="mood" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Feedbacks Récents</CardTitle>
          <CardDescription>Derniers retours des employés</CardDescription>
        </CardHeader>
        <CardContent>
          {feedbackData.length > 0 ? (
            <div className="space-y-4">
              {feedbackData.slice(-5).map((feedback, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{feedback.category}</Badge>
                    <span className="text-sm text-gray-500">{new Date(feedback.date).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <p className="text-gray-700">{feedback.message}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-500">Priorité:</span>
                    <Badge
                      variant={
                        feedback.priority === "high"
                          ? "destructive"
                          : feedback.priority === "medium"
                            ? "secondary"
                            : "default"
                      }
                      className="ml-2"
                    >
                      {feedback.priority === "high" ? "Haute" : feedback.priority === "medium" ? "Moyenne" : "Basse"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun feedback reçu pour le moment</p>
          )}
        </CardContent>
      </Card>

      {/* Survey Management */}
      <SurveyManager userRole="admin" />
    </div>
  )
}
