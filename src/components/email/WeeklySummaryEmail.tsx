import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import { Button } from '@react-email/button';
import { EmailLayout } from './EmailLayout';

interface WeeklySummaryEmailProps {
  userName: string;
  organizationName: string;
  weekSummary: {
    candidatesScreened: number;
    interviewsCompleted: number;
    hiresMade: number;
    hoursSaved: number;
    avgResponseTime: string;
    topPerformers: Array<{
      name: string;
      position: string;
      score: number;
      experience: string;
      avatar?: string;
    }>;
    upcomingInterviews: Array<{
      candidateName: string;
      position: string;
      date: string;
      time: string;
      interviewer: string;
    }>;
    recentHires: Array<{
      name: string;
      position: string;
      startDate: string;
    }>;
    efficiencyMetrics: {
      timeToHire: string;
      costPerHire: string;
      satisfactionRate: number;
    };
  };
  dashboardUrl?: string;
}

export const WeeklySummaryEmail = ({ 
  userName, 
  organizationName, 
  weekSummary,
  dashboardUrl = 'https://app.futuristic-hr.com/dashboard'
}: WeeklySummaryEmailProps) => (
  <EmailLayout 
    preview={`Weekly hiring summary: ${weekSummary.candidatesScreened} candidates screened, ${weekSummary.hiresMade} hires made`}
    footerText="Your weekly hiring insights powered by AI. Track your progress and optimize your recruitment strategy."
  >
    <Section>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#f0fdf4', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <span style={{ fontSize: '40px' }}>📊</span>
        </div>
        <Text style={{ color: '#1e293b', fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>
          Weekly Hiring Summary
        </Text>
        <Text style={{ color: '#64748b', fontSize: '16px', margin: '0' }}>
          {organizationName} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </div>
      
      <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
        Hi {userName},
      </Text>
      
      <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '32px' }}>
        Here's your comprehensive weekly hiring summary from Futuristic HR. You're making incredible progress with AI-powered recruitment!
      </Text>
      
      {/* Key Metrics Grid */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
        border: '1px solid #0ea5e9', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '32px' 
      }}>
        <Text style={{ color: '#0c4a6e', fontSize: '18px', fontWeight: '600', marginBottom: '20px', textAlign: 'center' }}>
          🚀 This Week's Performance
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="metric">
            <div className="metric-value" style={{ color: '#3b82f6' }}>{weekSummary.candidatesScreened}</div>
            <div className="metric-label">Candidates Screened</div>
          </div>
          <div className="metric">
            <div className="metric-value" style={{ color: '#10b981' }}>{weekSummary.interviewsCompleted}</div>
            <div className="metric-label">Interviews Completed</div>
          </div>
          <div className="metric">
            <div className="metric-value" style={{ color: '#8b5cf6' }}>{weekSummary.hiresMade}</div>
            <div className="metric-label">Hires Made</div>
          </div>
          <div className="metric">
            <div className="metric-value" style={{ color: '#f59e0b' }}>{weekSummary.hoursSaved}</div>
            <div className="metric-label">Hours Saved</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Text style={{ color: '#0c4a6e', fontSize: '14px', fontWeight: '500' }}>
            Avg Response Time: {weekSummary.avgResponseTime}
          </Text>
        </div>
      </div>

      {/* Top Performers */}
      {weekSummary.topPerformers.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <Text style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            🌟 Top Performing Candidates
          </Text>
          <div style={{ display: 'grid', gap: '12px' }}>
            {weekSummary.topPerformers.map((candidate, index) => (
              <div key={index} style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '16px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: '#e2e8f0', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      {candidate.avatar || '👤'}
                    </div>
                    <div>
                      <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600', margin: '0 0 2px 0' }}>
                        {candidate.name}
                      </Text>
                      <Text style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>
                        {candidate.position} • {candidate.experience}
                      </Text>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      backgroundColor: '#dcfce7', 
                      color: '#16a34a', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      {candidate.score}% Match
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Interviews */}
      {weekSummary.upcomingInterviews.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <Text style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            📅 Upcoming Interviews
          </Text>
          <div style={{ display: 'grid', gap: '12px' }}>
            {weekSummary.upcomingInterviews.map((interview, index) => (
              <div key={index} style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '16px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                      {interview.candidateName}
                    </Text>
                    <Text style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>
                      {interview.position}
                    </Text>
                    <Text style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '500' }}>
                      {interview.date} at {interview.time}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text style={{ color: '#64748b', fontSize: '11px', margin: '0' }}>
                      with {interview.interviewer}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Hires */}
      {weekSummary.recentHires.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <Text style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            🎉 Recent Hires
          </Text>
          <div style={{ display: 'grid', gap: '12px' }}>
            {weekSummary.recentHires.map((hire, index) => (
              <div key={index} style={{ 
                backgroundColor: '#f0fdf4', 
                border: '1px solid #bbf7d0', 
                borderRadius: '8px', 
                padding: '16px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text style={{ color: '#166534', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                      {hire.name}
                    </Text>
                    <Text style={{ color: '#16a34a', fontSize: '12px', margin: '0' }}>
                      {hire.position}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text style={{ color: '#16a34a', fontSize: '11px', margin: '0' }}>
                      Starts {hire.startDate}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Efficiency Metrics */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
        <Text style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          ⚡ Efficiency Metrics
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#3b82f6', fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>
              {weekSummary.efficiencyMetrics.timeToHire}
            </Text>
            <Text style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>Time to Hire</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#10b981', fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>
              {weekSummary.efficiencyMetrics.costPerHire}
            </Text>
            <Text style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>Cost per Hire</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#8b5cf6', fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>
              {weekSummary.efficiencyMetrics.satisfactionRate}%
            </Text>
            <Text style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>Satisfaction Rate</Text>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button
          href={dashboardUrl}
          className="button"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            display: 'inline-block'
          }}
        >
          View Full Dashboard →
        </Button>
      </div>
      
      <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <Text style={{ color: '#92400e', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          🏆 Achievement Unlocked
        </Text>
        <Text style={{ color: '#78350f', fontSize: '13px', lineHeight: '20px', margin: '0' }}>
          You've saved <strong>{weekSummary.hoursSaved} hours</strong> this week with AI-powered screening! That's {Math.round(weekSummary.hoursSaved * 60 / 40)} hours of traditional recruiting work automated.
        </Text>
      </div>
      
      <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <Text style={{ color: '#0c4a6e', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          📈 Recommendations for Next Week
        </Text>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '12px', marginTop: '2px' }}>•</span>
            <Text style={{ color: '#0c4a6e', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
              Consider scheduling interviews with your top 3 candidates this week
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '12px', marginTop: '2px' }}>•</span>
            <Text style={{ color: '#0c4a6e', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
              Your response time is excellent! Keep maintaining this level of engagement
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '12px', marginTop: '2px' }}>•</span>
            <Text style={{ color: '#0c4a6e', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
              Try expanding your job descriptions to attract more diverse candidates
            </Text>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e2e8f0' }}>
        <Text style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px 0' }}>
          Keep up the amazing work! 🚀
        </Text>
        <Text style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>
          Next weekly summary: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </div>
    </Section>
  </EmailLayout>
);
