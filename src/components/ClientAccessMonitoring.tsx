import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Activity, 
  Calendar, 
  Clock, 
  MapPin, 
  Smartphone, 
  TrendingUp, 
  RefreshCw, 
  CheckCircle, 
  QrCode,
  Radio,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import { Lead } from '../App';
import { getDynamicQrUrl } from '../utils/publicUrlHelper';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export interface AccessLogItem {
  id: string;
  leadId: string;
  timestamp: string;
  date: string;
  time: string;
  isoDate?: string;
  device?: string;
  location?: string;
  userAgent?: string;
}

interface ClientAccessMonitoringProps {
  lead: Lead;
  onRefresh?: () => void;
}

export const ClientAccessMonitoring: React.FC<ClientAccessMonitoringProps> = ({ lead, onRefresh }) => {
  const [logs, setLogs] = useState<AccessLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState(false);

  // Real-time Firestore subcollection 'acessos' subscription
  useEffect(() => {
    setIsLoading(true);
    let isMounted = true;

    try {
      const acessosRef = collection(db, 'leads', lead.id, 'acessos');
      const q = query(acessosRef, orderBy('timestamp', 'desc'), limit(150));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isMounted) return;
          const items: AccessLogItem[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            items.push({
              id: doc.id,
              leadId: data.leadId || lead.id,
              timestamp: data.timestamp || '',
              date: data.date || '',
              time: data.time || '',
              isoDate: data.isoDate || (data.timestamp ? data.timestamp.split('T')[0] : ''),
              device: data.device || 'Smartphone NFC',
              location: data.location || lead.city || 'Brasil',
              userAgent: data.userAgent || ''
            });
          });
          setLogs(items);
          setIsLoading(false);
        },
        async (error) => {
          console.warn('Fallback para API REST de acessos:', error.message);
          // Fallback to API if onSnapshot encounters permission or index issues
          try {
            const res = await fetch(`/api/leads/${lead.id}/access-logs`);
            if (res.ok && isMounted) {
              const data = await res.json();
              setLogs(data.logs || []);
            }
          } catch (_) {}
          if (isMounted) setIsLoading(false);
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (err) {
      console.error('Erro ao configurar listener do Firestore:', err);
      // Fallback fetch
      fetch(`/api/leads/${lead.id}/access-logs`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) setLogs(data.logs || []);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [lead.id]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/leads/${lead.id}/access-logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate chart data based on timeRange
  const chartData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const result: { dateKey: string; formattedDate: string; acessos: number }[] = [];
    
    // Create bucket for each day up to today
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayMonth = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      result.push({
        dateKey: iso,
        formattedDate: dayMonth,
        acessos: 0
      });
    }

    // Map logs to buckets
    logs.forEach((log) => {
      let logIso = log.isoDate;
      if (!logIso && log.timestamp) {
        try {
          logIso = new Date(log.timestamp).toISOString().split('T')[0];
        } catch (_) {}
      }

      if (logIso) {
        const item = result.find(r => r.dateKey === logIso);
        if (item) {
          item.acessos += 1;
        }
      }
    });

    return result;
  }, [logs, timeRange]);

  // Aggregate stats
  const totalScans = logs.length > 0 ? logs.length : (lead.totalScans || 0);
  const lastScan = logs[0] || (lead.lastScanAt ? {
    timestamp: lead.lastScanAt,
    date: new Date(lead.lastScanAt).toLocaleDateString('pt-BR'),
    time: new Date(lead.lastScanAt).toLocaleTimeString('pt-BR'),
    location: lead.city || 'Brasil'
  } : null);

  // Most frequent location
  const topLocation = useMemo(() => {
    if (logs.length === 0) return lead.city || 'Brasil';
    const counts: Record<string, number> = {};
    logs.forEach(l => {
      const loc = l.location || lead.city || 'Brasil';
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || lead.city || 'Brasil';
  }, [logs, lead.city]);

  // Simulate an access test (for immediate demonstration)
  const handleSimulateScan = async () => {
    try {
      setIsSimulating(true);
      const res = await fetch(`/api/leads/${lead.id}/simulate-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: lead.city ? `${lead.city}, BR` : 'São Paulo, SP'
        })
      });
      if (res.ok) {
        setSimulationSuccess(true);
        await fetchLogs();
        if (onRefresh) onRefresh();
        setTimeout(() => setSimulationSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao simular scan:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Leituras</span>
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalScans}</span>
            <span className="text-[11px] font-bold text-cyan-400">acessos</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Toques NFC + QR Codes</p>
        </div>

        {/* Last Scan Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Última Leitura</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {lastScan ? (
              <div className="space-y-0.5">
                <span className="text-base font-extrabold text-white block truncate">
                  {lastScan.date || 'Hoje'}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 block">
                  {lastScan.time || 'Recente'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Aguardando 1ª leitura</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Registro em tempo real</p>
        </div>

        {/* Device Types */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dispositivo</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-extrabold text-white">Smartphones</span>
          </div>
          <p className="text-[10px] text-purple-300 mt-1">Android &amp; iPhones compatíveis</p>
        </div>

        {/* Top Location */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Localização</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-base font-extrabold text-white block truncate">
              {topLocation}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Região aproximada de leitura</p>
        </div>
      </div>

      {/* Recharts Line Chart Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-black text-white">
                Evolução de Acessos da Placa NFC
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Quantidade de aproximações de celular e leituras de QR Code por dia
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timeRange === '7d' 
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Dias
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('14d')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timeRange === '14d' 
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                14 Dias
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timeRange === '30d' 
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Dias
              </button>
            </div>

            <button
              type="button"
              onClick={fetchLogs}
              disabled={isLoading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title="Atualizar dados agora"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Recharts Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                allowDecimals={false} 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <span className="font-bold text-slate-400 block">{data.formattedDate}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                          <span className="font-black text-white text-sm">
                            {data.acessos} {data.acessos === 1 ? 'leitura' : 'leituras'}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="acessos" 
                stroke="#06b6d4" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#06b6d4', stroke: '#0f172a', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Testing Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Cada aproximação de celular na placa física registra automaticamente novo acesso.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateScan}
              disabled={isSimulating}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isSimulating ? 'Registrando...' : 'Simular Leitura de Teste'}</span>
            </button>
            <a
              href={getDynamicQrUrl(lead.id)}
              target="_blank"
              rel="noreferrer"
              className="py-1.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
              title="Abre o link dinâmico da placa em nova aba para testar o redirecionamento"
            >
              <span>Testar Link da Placa</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {simulationSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Leitura simulada e computada com sucesso! O gráfico e a tabela foram atualizados.</span>
          </div>
        )}
      </div>

      {/* Access Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-black text-white">Histórico Detalhado de Leituras</h4>
            <p className="text-xs text-slate-400">Últimos acessos registrados da sua placa NFC / QR Code</p>
          </div>
          <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
            {logs.length} registros
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-300">Nenhum acesso registrado ainda</h5>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                Quando os clientes encostarem o celular na placa física ou escanearem o QR Code, cada leitura aparecerá aqui com data, hora e localização.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-black">Data &amp; Horário</th>
                  <th className="py-2.5 px-3 font-black">Dispositivo</th>
                  <th className="py-2.5 px-3 font-black">Localização Aproximada</th>
                  <th className="py-2.5 px-3 font-black text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {logs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-bold text-white">{log.date || 'Hoje'}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{log.time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{log.device || 'Smartphone NFC'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{log.location || lead.city || 'Brasil'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Redirecionado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
