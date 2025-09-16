"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Heart, Calendar } from "lucide-react"

interface MoodEntry {
  id: string
  date: string
  value: number
  emoji: string
  note?: string
}

const moodOptions = [
  { value: 1, emoji: "😢", label: "Très mauvais", color: "bg-red-500" },
  { value: 2, emoji: "😕", label: "Mauvais", color: "bg-orange-500" },
  { value: 3, emoji: "😐", label: "Neutre", color: "bg-yellow-500" },
  { value: 4, emoji: "😊", label: "Bon", color: "bg-green-500" },
  { value: 5, emoji: "😄", label: "Excellent", color: "bg-blue-500" },
]

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [note, setNote] = useState("")
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null)

  useEffect(() => {
    loadMoodHistory()
  }, [])

  const loadMoodHistory = () => {
    const saved = localStorage.getItem("userMoods")
    if (saved) {
      const moods = JSON.parse(saved)
      setMoodHistory(moods)

      // Check if mood already submitted today
      const today = new Date().toDateString()
      const todayEntry = moods.find((mood: MoodEntry) => new Date(mood.date).toDateString() === today)
      setTodayMood(todayEntry || null)
    }
  }

  const saveMood = () => {
    if (selectedMood === null) return

    const today = new Date().toDateString()
    const moodEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      value: selectedMood,
      emoji: moodOptions[selectedMood - 1].emoji,
      note: note.trim() || undefined,
    }

    let updatedHistory = [...moodHistory]

    // Remove existing entry for today if it exists
    updatedHistory = updatedHistory.filter((mood) => new Date(mood.date).toDateString() !== today)

    // Add new entry
    updatedHistory.push(moodEntry)
    updatedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setMoodHistory(updatedHistory)
    setTodayMood(moodEntry)
    localStorage.setItem("userMoods", JSON.stringify(updatedHistory))

    // Also save to global moods for admin dashboard
    const allMoods = JSON.parse(localStorage.getItem("allMoods") || "[]")
    const globalUpdated = allMoods.filter((mood: any) => new Date(mood.date).toDateString() !== today)
    globalUpdated.push({ ...moodEntry, userId: "current-user" })
    localStorage.setItem("allMoods", JSON.stringify(globalUpdated))

    // Reset form
    setSelectedMood(null)
    setNote("")
  }

  const getWeeklyAverage = () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weeklyMoods = moodHistory.filter((mood) => new Date(mood.date) >= weekAgo)

    if (weeklyMoods.length === 0) return 0

    const average = weeklyMoods.reduce((sum, mood) => sum + mood.value, 0) / weeklyMoods.length
    return Math.round(average * 10) / 10
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Baromètre d'Humeur Quotidien
          </CardTitle>
          <CardDescription>
            Partagez votre état d'esprit pour nous aider à améliorer votre environnement de travail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {todayMood ? (
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="text-4xl mb-2">{todayMood.emoji}</div>
              <p className="text-green-800 font-medium">Merci ! Votre humeur d'aujourd'hui a été enregistrée</p>
              <p className="text-green-600 text-sm mt-1">{moodOptions[todayMood.value - 1].label}</p>
              {todayMood.note && <p className="text-green-700 text-sm mt-2 italic">"{todayMood.note}"</p>}
            </div>
          ) : (
            <>
              <div>
                <Label className="text-base font-medium">Comment vous sentez-vous aujourd'hui ?</Label>
                <div className="grid grid-cols-5 gap-3 mt-3">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedMood === mood.value
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-3xl mb-2">{mood.emoji}</div>
                      <div className="text-xs font-medium text-gray-700">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="mood-note">Note (optionnel)</Label>
                <Textarea
                  id="mood-note"
                  placeholder="Ajoutez un commentaire sur votre humeur du jour..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <Button onClick={saveMood} disabled={selectedMood === null} className="w-full">
                Enregistrer mon humeur
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Moyenne Hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{getWeeklyAverage()}/5</div>
              <p className="text-gray-600 text-sm">Basé sur les 7 derniers jours</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{moodHistory.length}</div>
              <p className="text-gray-600 text-sm">Entrées enregistrées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent History */}
      {moodHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Historique Récent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodHistory.slice(0, 7).map((mood) => (
                <div key={mood.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mood.emoji}</span>
                    <div>
                      <p className="font-medium">{moodOptions[mood.value - 1].label}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(mood.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {mood.note && <p className="text-sm text-gray-600 italic max-w-xs truncate">"{mood.note}"</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
