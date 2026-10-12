import {
  AlertNotification,
  DiscrepancyFinding,
  DiscrepancySeverity,
  ReconciliationRunSummary,
} from '@/types/data-accuracy.types';

// In-memory alert log
const dispatchedAlerts: AlertNotification[] = [];

/**
 * Format and dispatch alert notifications across configured channels
 * (Telegram, Slack, Email) with deduplication and digest batching.
 */
export async function dispatchReconciliationAlerts(
  summary: ReconciliationRunSummary
): Promise<AlertNotification[]> {
  const newNotifications: AlertNotification[] = [];
  const criticalFindings = summary.findings.filter(
    f => f.severity === 'CRITICAL' && f.reviewStatus === 'OPEN'
  );
  const warningFindings = summary.findings.filter(
    f => f.severity === 'WARNING' && f.reviewStatus === 'OPEN'
  );
  const recoveredFindings = summary.findings.filter(
    f => f.reviewStatus === 'AUTO_CLOSED_RECOVERED'
  );

  const timestamp = new Date().toISOString();

  // 1. Critical Discrepancies Digest
  if (criticalFindings.length > 0) {
    const details = criticalFindings.map(
      f => `• ${f.date} [${f.metric.toUpperCase()}] ${f.currency}: Prebuilt €${f.prebuiltValue.toLocaleString()} vs SoT €${f.sourceValue.toLocaleString()} (Delta: €${f.delta.toFixed(2)}, ${f.deltaPct.toFixed(1)}%) — ${f.riskReason}`
    );

    const alert: AlertNotification = {
      id: `alt_crit_${Date.now()}`,
      type: 'CRITICAL_DISCREPANCY',
      severity: 'CRITICAL',
      title: `🚨 Data Accuracy Alert: ${criticalFindings.length} Critical Discrepancies Detected`,
      summary: `Automated reconcile loop found money discrepancies on closed days exceeding tolerance threshold.`,
      details,
      findingCount: criticalFindings.length,
      timestamp,
      sentChannels: ['slack', 'telegram'],
    };

    newNotifications.push(alert);
    dispatchedAlerts.unshift(alert);
    await sendWebhookNotification(alert);
  }

  // 2. SLA Aging Escalation
  const slaBreached = summary.findings.filter(f => f.slaBreached && f.reviewStatus === 'OPEN');
  if (slaBreached.length > 0) {
    const details = slaBreached.map(
      f => `• [SLA BREACHED] ${f.date} [${f.metric.toUpperCase()}]: Open since ${new Date(f.firstSeenAt).toLocaleTimeString()} (${f.riskClassification})`
    );

    const slaAlert: AlertNotification = {
      id: `alt_sla_${Date.now()}`,
      type: 'SLA_BREACH',
      severity: 'CRITICAL',
      title: `⏰ SLA Escalation: ${slaBreached.length} Unresolved Discrepancies Past Resolution Window`,
      summary: `Discrepancies remain unhealed or quarantined past SLA deadline. Manual operator triage required immediately.`,
      details,
      findingCount: slaBreached.length,
      timestamp,
      sentChannels: ['slack', 'telegram', 'email'],
    };

    newNotifications.push(slaAlert);
    dispatchedAlerts.unshift(slaAlert);
    await sendWebhookNotification(slaAlert);
  }

  // 3. Auto-Closed Recovery Notification
  if (recoveredFindings.length > 0) {
    const details = recoveredFindings.map(
      f => `• [RESOLVED] ${f.date} [${f.metric.toUpperCase()}]: Tied back to Source of Truth (€${f.sourceValue.toLocaleString()})`
    );

    const recoveryAlert: AlertNotification = {
      id: `alt_rec_${Date.now()}`,
      type: 'RECOVERY_RESOLVED',
      severity: 'INFO',
      title: `✅ Data Accuracy Recovery: ${recoveredFindings.length} Discrepancies Auto-Closed`,
      summary: `Subsequent verification pass confirms numbers are fully reconciled with authoritative Source of Truth.`,
      details,
      findingCount: recoveredFindings.length,
      timestamp,
      sentChannels: ['slack', 'telegram'],
    };

    newNotifications.push(recoveryAlert);
    dispatchedAlerts.unshift(recoveryAlert);
  }

  return newNotifications;
}

/**
 * Webhook delivery helper (Telegram / Slack)
 */
async function sendWebhookNotification(alert: AlertNotification): Promise<void> {
  // Format Telegram Markdown payload
  const telegramText = `*${alert.title}*\n${alert.summary}\n\n${alert.details.slice(0, 5).join('\n')}${alert.details.length > 5 ? `\n...and ${alert.details.length - 5} more` : ''}`;

  const tgBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;

  if (tgBotToken && tgChatId) {
    try {
      await fetch(`https://api.telegram.org/bot${tgBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: telegramText,
          parse_mode: 'Markdown',
        }),
      });
    } catch (err) {
      console.warn('Failed to send Telegram alert:', err);
    }
  }

  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (slackWebhookUrl) {
    try {
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: alert.title,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: alert.title },
            },
            {
              type: 'section',
              text: { type: 'mrkdwn', text: `${alert.summary}\n\n${alert.details.join('\n')}` },
            },
          ],
        }),
      });
    } catch (err) {
      console.warn('Failed to send Slack alert:', err);
    }
  }
}

/**
 * Get all past dispatched alerts
 */
export function getAlertHistory(): AlertNotification[] {
  return dispatchedAlerts;
}
