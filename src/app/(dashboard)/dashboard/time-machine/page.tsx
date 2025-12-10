'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimeMachine } from '@/components/dashboard/time-machine';
import { useProfiles } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { History } from 'lucide-react';

export default function TimeMachinePage() {
  const { data: profilesData, isLoading } = useProfiles({ limit: 50 });
  const profiles = React.useMemo(
    () => profilesData?.items ?? [],
    [profilesData?.items]
  );
  const [profileId, setProfileId] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!profileId && profiles.length > 0) {
      setProfileId(profiles[0].id);
    }
  }, [profiles, profileId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Time Machine</CardTitle>
              <p className="text-sm text-muted-foreground">Select a profile to inspect snapshot history.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No profiles available yet.</p>
          ) : (
            <Select value={profileId} onValueChange={(value) => setProfileId(value)}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <TimeMachine profileId={profileId} />
    </div>
  );
}
