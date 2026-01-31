
import React from 'react';
import { Users, FileText, CheckCircle2, Briefcase } from 'lucide-react';
import { HiringForm, Resume, EvaluationResult, CandidateStatus } from '../types';
import { MetricCard } from '@/components/cards/MetricCard';
import { RecentActivityTable } from '@/components/tables/RecentActivityTable';

interface DashboardProps {
  forms: HiringForm[];
  resumes: Resume[];
  evaluations: EvaluationResult[];
}

const Dashboard: React.FC<DashboardProps> = ({ forms, evaluations }) => {
  const totalCandidates = evaluations.length;
  const shortlisted = evaluations.filter(e => e.status === CandidateStatus.SHORTLISTED).length;
  const hired = evaluations.filter(e => e.status === CandidateStatus.HIRED).length;

  // Mock activity data derived from evaluations for demonstration
  const recentActivity = evaluations.slice(0, 5).map(ev => ({
    id: ev.id,
    candidateName: ev.candidateName,
    role: 'Senior Frontend Engineer', // This would ideally come from a join or lookup
    status: ev.status,
    timestamp: ev.timestamp,
    score: ev.score
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Global recruitment performance and active pipelines.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Candidates"
          value={totalCandidates}
          icon={Users}
          description="+20.1% from last month"
        />
        <MetricCard
          title="Shortlisted"
          value={shortlisted}
          icon={CheckCircle2}
          description="Candidates moved to interview"
        />
        <MetricCard
          title="Active Roles"
          value={forms.length}
          icon={FileText}
          description="Currently hiring"
        />
        <MetricCard
          title="Hired"
          value={hired}
          icon={Briefcase}
          description="Filled positions this quarter"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          {/* Placeholder for a Chart */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Application Trend</h3>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
              <p className="text-muted-foreground text-sm">Chart Component Placeholder</p>
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <RecentActivityTable data={recentActivity.length > 0 ? recentActivity : []} />
            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent activity found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
