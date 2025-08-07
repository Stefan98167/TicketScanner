import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useTheme } from '../lib/theme/ThemeProvider';
import { useI18n } from '../lib/i18n/I18nProvider';
import { supabase } from '../supabase';

type ByHour = { hour: string; count: number };
type ByDevice = { device_id: string; count: number };
type ScanLog = {
  id: number;
  created_at: string;
  action: string;
  ticket_code: string;
  is_valid: boolean;
  was_devalued: boolean;
  success: boolean;
  message: string | null;
};

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = React.useState<'history' | 'stats'>('history');
  const [totalTickets, setTotalTickets] = React.useState<number | null>(null);
  const [totalChecks, setTotalChecks] = React.useState<number | null>(null);
  const [byHour, setByHour] = React.useState<ByHour[]>([]);
  const [byDevice, setByDevice] = React.useState<ByDevice[]>([]);
  const [scanLogs, setScanLogs] = React.useState<ScanLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ count: ticketsCount }, { count: checksCount }] = await Promise.all([
        supabase.from('tickets').select('*', { count: 'exact', head: true }),
        supabase.from('scan_logs').select('*', { count: 'exact', head: true }),
      ]);
      setTotalTickets(ticketsCount ?? 0);
      setTotalChecks(checksCount ?? 0);

      const from = new Date();
      from.setDate(from.getDate() - 1); // Last 24 hours
      from.setHours(0, 0, 0, 0);
      const fromIso = from.toISOString();
      
      const [hourly, byDev, logs] = await Promise.all([
        supabase
          .from('scan_logs')
          .select('created_at')
          .gte('created_at', fromIso)
          .order('created_at', { ascending: true }),
        supabase
          .from('scan_logs')
          .select('device_id')
          .gte('created_at', fromIso),
        supabase
          .from('scan_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      const perHour = new Map<string, number>();
      if (hourly.data) {
        hourly.data.forEach((row: any) => {
          const d = new Date(row.created_at);
          const key = `${d.getHours().toString().padStart(2, '0')}:00`;
          perHour.set(key, (perHour.get(key) ?? 0) + 1);
        });
      }
      const hours: ByHour[] = [];
      for (let i = 0; i < 24; i += 1) {
        const hour = `${i.toString().padStart(2, '0')}:00`;
        hours.push({ hour, count: perHour.get(hour) ?? 0 });
      }
      setByHour(hours);

      const perDev = new Map<string, number>();
      if (byDev.data) {
        byDev.data.forEach((row: any) => {
          const key = row.device_id ?? 'unknown';
          perDev.set(key, (perDev.get(key) ?? 0) + 1);
        });
      }
      const top = Array.from(perDev.entries())
        .map(([device_id, count]) => ({ device_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      setByDevice(top);

      if (logs.data) {
        setScanLogs(logs.data as ScanLog[]);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => router.back();

  const ratio = totalTickets && totalTickets > 0 && totalChecks != null
    ? `${totalChecks}/${totalTickets}`
    : '—';

  const maxHour = Math.max(1, ...byHour.map((h) => h.count));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
  };

  const renderScanLog = ({ item }: { item: ScanLog }) => (
    <View style={[styles.logItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.logHeader}>
        <Text style={[styles.logCode, { color: colors.text }]}>{item.ticket_code}</Text>
        <Text style={[styles.logStatus, { color: item.success ? colors.success : colors.error }]}>
          {item.success ? t('history.ok') : t('history.error')}
        </Text>
      </View>
      <View style={styles.logDetails}>
        <Text style={[styles.logAction, { color: colors.mutedText }]}>
          {item.action === 'check' ? t('history.action_check') : t('history.action_devalue')}
        </Text>
        <Text style={[styles.logDate, { color: colors.mutedText }]}>
          {formatDate(item.created_at)}
        </Text>
      </View>
      {item.message && (
        <Text style={[styles.logMessage, { color: colors.mutedText }]} numberOfLines={2}>
          {item.message}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>{t('common.back')}</Text>
        </TouchableOpacity>

        <Text style={[styles.icon, { color: colors.text }]}>📊</Text>
        <Text style={[styles.title, { color: colors.text }]}>{t('home.analytics_title')}</Text>

        <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'history' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveTab('history')}
          >
                         <Text style={[styles.tabText, { color: activeTab === 'history' ? '#ffffff' : colors.text }]}>
               {t('history.title')}
             </Text>
           </TouchableOpacity>
           <TouchableOpacity
             style={[
               styles.tab,
               activeTab === 'stats' && { backgroundColor: colors.primary }
             ]}
             onPress={() => setActiveTab('stats')}
           >
             <Text style={[styles.tabText, { color: activeTab === 'stats' ? '#ffffff' : colors.text }]}>
               {t('reports.title')}
             </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'history' ? (
          <View style={styles.historyContainer}>
            {loading ? (
              <Text style={[styles.loadingText, { color: colors.mutedText }]}>{t('history.loading')}</Text>
            ) : scanLogs.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>{t('history.empty')}</Text>
            ) : (
              <FlatList
                data={scanLogs}
                renderItem={renderScanLog}
                keyExtractor={(item) => item.id.toString()}
                style={styles.logList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        ) : (
          <ScrollView style={styles.statsContainer} showsVerticalScrollIndicator={false}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t('reports.overview')}</Text>
              <View style={styles.kpis}>
                <KPI label={t('reports.total_tickets')} value={totalTickets ?? 0} colors={colors} />
                <KPI label={t('reports.total_checks')} value={totalChecks ?? 0} colors={colors} />
                <KPI label={t('reports.checks_of_tickets')} value={ratio} colors={colors} />
              </View>
            </View>

                         <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
               <Text style={[styles.cardTitle, { color: colors.text }]}>{t('reports.scans_last_24_hours')}</Text>
               <View style={styles.chartContainer}>
                 {byHour.length === 0 ? (
                   <Text style={{ color: colors.mutedText }}>{t('reports.no_data')}</Text>
                 ) : (
                   <View style={styles.lineChart}>
                     <View style={styles.chartArea}>
                       {byHour.map((h, idx) => {
                         const height = maxHour > 0 ? (h.count / maxHour) * 60 : 0;
                         return (
                           <View key={idx} style={styles.barContainer}>
                             <View style={[styles.bar, { height: Math.max(2, height), backgroundColor: colors.primary }]} />
                             <Text style={[styles.barLabel, { color: colors.mutedText }]}>{h.count}</Text>
                           </View>
                         );
                       })}
                     </View>
                     <View style={styles.xAxis}>
                       {byHour.map((h, idx) => (
                         <Text key={idx} style={[styles.hourLabel, { color: colors.mutedText }]}>{h.hour}</Text>
                       ))}
                     </View>
                   </View>
                 )}
               </View>
             </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t('reports.by_device')}</Text>
              <View style={{ gap: 8, width: '100%' }}>
                {byDevice.length === 0 ? (
                  <Text style={{ color: colors.mutedText }}>{t('reports.no_data')}</Text>
                ) : (
                  byDevice.map((d) => (
                    <View key={d.device_id} style={[styles.deviceRow, { borderColor: colors.border }]}> 
                      <Text style={[styles.deviceId, { color: colors.text }]} numberOfLines={1}>{d.device_id}</Text>
                      <Text style={{ color: colors.mutedText }}>{d.count}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function KPI({ label, value, colors }: { label: string; value: string | number; colors: any }) {
  return (
    <View style={styles.kpi}>
      <Text style={[styles.kpiValue, { color: colors.text }]}>{String(value)}</Text>
      <Text style={{ color: colors.mutedText, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  content: { flex: 1, alignItems: 'center' },
  backButton: { position: 'absolute', top: 40, left: 0, padding: 10 },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  icon: { fontSize: 40, marginTop: 60, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyContainer: { flex: 1, width: '100%', maxWidth: 500 },
  statsContainer: { flex: 1, width: '100%', maxWidth: 500 },
  loadingText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  logList: { flex: 1 },
  logItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logCode: { fontSize: 16, fontWeight: '600' },
  logStatus: { fontSize: 14, fontWeight: '500' },
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logAction: { fontSize: 14 },
  logDate: { fontSize: 12 },
  logMessage: { fontSize: 12, fontStyle: 'italic' },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  kpis: { flexDirection: 'row', justifyContent: 'space-between' },
  kpi: { alignItems: 'center', minWidth: 90 },
  kpiValue: { fontSize: 20, fontWeight: '800' },
  chartContainer: { height: 140, marginTop: 8 },
  lineChart: { height: 100 },
  chartArea: { flexDirection: 'row', height: 60, alignItems: 'flex-end' },
  barContainer: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 8, borderRadius: 4, marginBottom: 4 },
  barLabel: { fontSize: 10, textAlign: 'center' },
  xAxis: { flexDirection: 'row', marginTop: 8 },
  hourLabel: { fontSize: 10, flex: 1, textAlign: 'center' },
  deviceRow: { flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 },
  deviceId: { flex: 1, marginRight: 8 },
});
