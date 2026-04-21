import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:w-auto lg:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <div className="bg-slate-50 border-b p-3 flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/12" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/12" />
                <Skeleton className="h-4 w-1/12" />
                <Skeleton className="h-4 w-1/12" />
                <Skeleton className="h-4 w-1/12" />
              </div>
              {[...Array(10)].map((_, i) => (
                <div key={i} className="p-4 border-b last:border-0 flex justify-between items-center">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-4 w-1/12" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/12" />
                  <Skeleton className="h-4 w-1/12" />
                  <Skeleton className="h-6 w-1/12 rounded-full" />
                  <Skeleton className="h-6 w-1/12 rounded-full" />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4">
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
