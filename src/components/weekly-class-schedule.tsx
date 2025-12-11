"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Sparkles, PartyPopper, Users } from "lucide-react"

interface ClassSession {
  time: string
  instructor: string
  classType: string
}

interface DaySchedule {
  day: string
  classes: ClassSession[]
}

const weeklySchedule: DaySchedule[] = [
  {
    day: "Monday",
    classes: [
      { time: "6:00 AM – 7:00 AM", instructor: "Joi", classType: "Mat Pilates" },
      { time: "11:00 AM – 12:00 PM", instructor: "Drelle", classType: "Fitness / Strength" },
      { time: "4:00 PM – 5:00 PM", instructor: "Nasir", classType: "Meditation / Herbal Wellness" },
      { time: "7:00 PM – 8:00 PM", instructor: "Ivori", classType: "Group Fitness / Zumba" },
    ]
  },
  {
    day: "Tuesday",
    classes: [
      { time: "6:00 AM – 7:00 AM", instructor: "Joi", classType: "Mat Pilates" },
      { time: "9:15 AM – 10:15 AM", instructor: "Maisha", classType: "Yoga" },
      { time: "11:00 AM – 12:00 PM", instructor: "Drelle", classType: "Fitness / Strength" },
    ]
  },
  {
    day: "Wednesday",
    classes: [
      { time: "6:00 AM – 7:00 AM", instructor: "Joi", classType: "Mat Pilates" },
      { time: "1:00 PM – 2:00 PM", instructor: "Drelle", classType: "Fitness / Strength" },
      { time: "3:30 PM – 4:30 PM", instructor: "Nasir", classType: "Meditation / Herbal Wellness" },
      { time: "5:00 PM – 6:00 PM", instructor: "Jewlz", classType: "Fitness" },
      { time: "6:30 PM – 7:30 PM", instructor: "Des", classType: "Dance Fitness" },
      { time: "8:00 PM – 9:00 PM", instructor: "Ivori", classType: "Group Fitness / Zumba" },
    ]
  },
  {
    day: "Thursday",
    classes: [
      { time: "6:00 AM – 7:00 AM", instructor: "Joi", classType: "Mat Pilates" },
      { time: "9:15 AM – 10:15 AM", instructor: "Maisha", classType: "Yoga" },
      { time: "11:00 AM – 12:00 PM", instructor: "Drelle", classType: "Fitness / Strength" },
      { time: "6:00 PM – 7:00 PM", instructor: "Des", classType: "Dance Fitness" },
      { time: "7:30 PM – 8:30 PM", instructor: "Ivori", classType: "Group Fitness / Zumba" },
    ]
  },
  {
    day: "Friday",
    classes: [
      { time: "6:00 AM – 7:00 AM", instructor: "Joi", classType: "Mat Pilates" },
      { time: "11:00 AM – 12:00 PM", instructor: "Drelle", classType: "Fitness / Strength" },
      { time: "4:00 PM – 5:00 PM", instructor: "Nasir", classType: "Meditation / Herbal Wellness" },
    ]
  },
  {
    day: "Saturday",
    classes: [
      { time: "8:00 AM – 9:00 AM", instructor: "Tyra", classType: "Strength Training / HIIT / Mat Pilates" },
      { time: "10:00 AM – 11:00 AM", instructor: "Nasir", classType: "Meditation / Herbal Wellness" },
      { time: "11:45 AM – 12:45 PM", instructor: "Des", classType: "Dance Fitness" },
      { time: "1:30 PM – 2:30 PM", instructor: "Drelle", classType: "Fitness / Strength" },
    ]
  },
  {
    day: "Sunday",
    classes: [
      { time: "8:00 AM – 9:00 AM", instructor: "Nasir", classType: "Meditation / Herbal Wellness" },
      { time: "10:00 AM – 11:00 AM", instructor: "Drelle", classType: "Fitness / Strength" },
      { time: "12:00 PM – 1:00 PM", instructor: "Des", classType: "Dance Fitness" },
    ]
  },
]

const softOpeningSchedule = [
  { time: "8:30 AM", event: "Doors Open / Welcome", isClass: false },
  { time: "9:00 AM – 9:30 AM", event: "Meditation & Herbal Wellness", instructor: "Nasir", isClass: true },
  { time: "9:30 AM – 10:00 AM", event: "Break / Transition — Refreshments, Studio Tours", isClass: false },
  { time: "10:00 AM – 10:30 AM", event: "Dance Fitness", instructor: "Des", isClass: true },
  { time: "10:30 AM – 11:00 AM", event: "Break / Transition", isClass: false },
  { time: "11:00 AM – 11:30 AM", event: "Fitness / Strength Training", instructor: "Drelle", isClass: true },
  { time: "11:30 AM – 12:00 PM", event: "Break / Transition", isClass: false },
  { time: "12:00 PM – 12:30 PM", event: "Meditation / Breathwork Reset", instructor: "Nasir", isClass: true },
  { time: "12:30 PM – 1:00 PM", event: "Break / Studio Reset", isClass: false },
  { time: "1:00 PM – 2:00 PM", event: "Meet & Greet — Meet the instructors, learn about class offerings, membership info, music & snacks!", isClass: false, isHighlight: true },
]

function getClassTypeColor(classType: string): string {
  if (classType.toLowerCase().includes("pilates")) return "bg-[#E8B4B8]/20 text-[#5A5550] border-[#E8B4B8]"
  if (classType.toLowerCase().includes("yoga")) return "bg-[#9BA899]/20 text-[#5A5550] border-[#9BA899]"
  if (classType.toLowerCase().includes("meditation") || classType.toLowerCase().includes("wellness")) return "bg-[#B8AFA5]/20 text-[#5A5550] border-[#B8AFA5]"
  if (classType.toLowerCase().includes("dance") || classType.toLowerCase().includes("zumba")) return "bg-[#FFE4B5]/40 text-[#5A5550] border-[#FFD699]"
  if (classType.toLowerCase().includes("fitness") || classType.toLowerCase().includes("strength") || classType.toLowerCase().includes("hiit")) return "bg-[#9BA899]/30 text-[#5A5550] border-[#8A9788]"
  return "bg-[#FAF8F5] text-[#5A5550] border-[#B8AFA5]"
}

export function SoftOpeningBanner() {
  return (
    <Card className="border-2 border-[#E8B4B8] bg-gradient-to-r from-[#FFF5F7] via-white to-[#F5F9F5] overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#E8B4B8]/20 flex items-center justify-center">
            <PartyPopper className="h-5 w-5 text-[#E8B4B8]" />
          </div>
          <div>
            <Badge className="bg-[#E8B4B8] text-white border-none mb-1">Special Event</Badge>
            <CardTitle className="text-2xl md:text-3xl font-serif font-light text-[#5A5550]">
              Soft Opening Celebration
            </CardTitle>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#7A736B]">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-[#9BA899]" />
            Saturday, December 13, 2025
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[#9BA899]" />
            8:30 AM – 2:00 PM
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[#7A736B] mb-6">
          Join us for our soft opening! Experience sample classes, meet our amazing instructors, and learn about what Swift Fit Pilates & Wellness has to offer.
        </p>
        
        <div className="space-y-2">
          {softOpeningSchedule.map((item, index) => (
            <div 
              key={index} 
              className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-xl transition-all ${
                item.isHighlight 
                  ? "bg-[#9BA899]/20 border border-[#9BA899]" 
                  : item.isClass 
                    ? "bg-white border border-[#B8AFA5]/30 hover:border-[#9BA899]/50" 
                    : "bg-[#FAF8F5] border border-transparent"
              }`}
            >
              <span className="text-sm font-medium text-[#9BA899] min-w-[140px]">{item.time}</span>
              <div className="flex-1">
                <span className={`text-sm ${item.isClass ? "font-medium text-[#5A5550]" : "text-[#7A736B]"}`}>
                  {item.event}
                </span>
                {item.instructor && (
                  <span className="text-sm text-[#9BA899] ml-2">with {item.instructor}</span>
                )}
              </div>
              {item.isHighlight && (
                <Badge className="bg-[#9BA899] text-white border-none self-start sm:self-auto">
                  <Users className="h-3 w-3 mr-1" />
                  Don't Miss!
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function WeeklyClassSchedule() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#9BA899]/10 rounded-full px-4 py-2 mb-4">
          <Sparkles className="h-4 w-4 text-[#9BA899]" />
          <span className="text-sm font-medium text-[#5A5550]">Starting December 15, 2025</span>
        </div>
        <h3 className="font-serif text-2xl md:text-3xl text-[#5A5550] font-light">
          Weekly Class Schedule
        </h3>
      </div>

      <div className="grid gap-4 md:gap-6">
        {weeklySchedule.map((day) => (
          <Card key={day.day} className="border-[#B8AFA5]/30 bg-white overflow-hidden">
            <CardHeader className="bg-[#F5F2EE] border-b border-[#B8AFA5]/20 py-3 px-4 md:px-6">
              <CardTitle className="text-lg md:text-xl font-serif font-normal text-[#5A5550]">
                {day.day}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3">
                {day.classes.map((session, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#B8AFA5]/20 hover:border-[#9BA899]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:min-w-[160px]">
                      <Clock className="h-4 w-4 text-[#9BA899] shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-[#5A5550]">{session.time}</span>
                    </div>
                    <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                      <Badge 
                        variant="outline" 
                        className={`rounded-full text-[10px] sm:text-xs whitespace-normal max-w-full ${getClassTypeColor(session.classType)}`}
                      >
                        {session.classType}
                      </Badge>
                      <span className="text-xs sm:text-sm text-[#7A736B]">
                        with <span className="font-medium text-[#5A5550]">{session.instructor}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-[#9BA899]/10 rounded-2xl border border-[#9BA899]/20">
        <h4 className="font-serif text-lg text-[#5A5550] mb-3">Class Types Legend</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full text-xs bg-[#E8B4B8]/20 text-[#5A5550] border-[#E8B4B8]">Mat Pilates</Badge>
          <Badge variant="outline" className="rounded-full text-xs bg-[#9BA899]/20 text-[#5A5550] border-[#9BA899]">Yoga</Badge>
          <Badge variant="outline" className="rounded-full text-xs bg-[#B8AFA5]/20 text-[#5A5550] border-[#B8AFA5]">Meditation / Wellness</Badge>
          <Badge variant="outline" className="rounded-full text-xs bg-[#FFE4B5]/40 text-[#5A5550] border-[#FFD699]">Dance / Zumba</Badge>
          <Badge variant="outline" className="rounded-full text-xs bg-[#9BA899]/30 text-[#5A5550] border-[#8A9788]">Fitness / Strength</Badge>
        </div>
      </div>
    </div>
  )
}
