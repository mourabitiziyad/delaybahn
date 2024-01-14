"use client";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";

export default function Stats() {

  return (
    <Card className="mx-auto w-full max-w-2xl">
    <CardHeader>
      <CardTitle>Statistics</CardTitle>
      <CardDescription>Some Stats</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      
    </CardContent>
  </Card>
  )
}
