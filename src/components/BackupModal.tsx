// src/components/BackupModal.tsx
// ─────────────────────────────────────────────────────────────
// Modal de Backup e Restauração de Save do Jogo de Pesca
// Suporta:
// 1. Download de arquivo .json com todo o progresso.
// 2. Cópia do JSON para a área de transferência.
// 3. Importação via upload de arquivo .json ou colar texto.
// 4. Pré-visualização segura antes de aplicar a restauração.
// 5. Reinício opcional de progresso com confirmação dupla.
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Upload,
  Copy,
  Check,
  FileJson,
  AlertTriangle,
  RefreshCw,
  Trash2,
  X,
  Sparkles,
  ShieldCheck,
  User,
  Coins,
  Trophy,
} from 'lucide-react';
import { PlayerProfile } from '../game/managers/PlayerManager.js';
import { sound } from '../utils/audio.js';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  onExportSave: () => { filename: string; json: string; summary: any };
  onImportSave: (jsonContent: string) => { ok: boolean; error?: string };
  onResetSave: () => void;
  onShowToast: (message: string, type: 'info' | 'success' | 'warning') => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  player,
  onExportSave,
  onImportSave,
  onResetSave,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'reset'>('export');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [previewData, setPreviewData] = useState<{
    name: string;
    level: number;
    coins: number;
    fishCaught: number;
    exportedAt?: string;
    rawJson: string;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Realiza o download do arquivo JSON
  const handleDownloadFile = () => {
    try {
      const { filename, json } = onExportSave();
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      sound.playCoins();
      onShowToast('Arquivo de save baixado com sucesso!', 'success');
    } catch (err: any) {
      onShowToast('Falha ao gerar arquivo de download: ' + err?.message, 'warning');
    }
  };

  // Copia o JSON para o clipboard
  const handleCopyJson = () => {
    try {
      const { json } = onExportSave();
      navigator.clipboard.writeText(json);
      setCopied(true);
      sound.playCoins();
      onShowToast('Dados copiados para a área de transferência!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Não foi possível copiar automaticamente.', 'warning');
    }
  };

  // Processa o conteúdo de texto para pré-visualização segura
  const processImportString = (content: string) => {
    setImportError(null);
    try {
      const parsed = JSON.parse(content);
      let pSummary: any = null;

      if (parsed.playerSummary) {
        pSummary = parsed.playerSummary;
      } else if (parsed.data) {
        // Encontra o player dentro de data
        for (const [k, v] of Object.entries(parsed.data)) {
          if (k.startsWith('player:') && v && typeof v === 'object') {
            pSummary = v;
            break;
          }
        }
      } else if (parsed.level !== undefined && parsed.name) {
        pSummary = parsed;
      }

      if (!pSummary) {
        setPreviewData(null);
        setImportError('Nenhum dado de pescador reconhecido neste formato de save.');
        return;
      }

      setPreviewData({
        name: pSummary.name || 'Pescador',
        level: pSummary.level || 1,
        coins: pSummary.coins || 0,
        fishCaught: pSummary.stats?.totalFishCaught ?? pSummary.fishCaught ?? 0,
        exportedAt: parsed.exportedAt,
        rawJson: content,
      });
      sound.playSplash();
    } catch (e: any) {
      setPreviewData(null);
      setImportError('Arquivo inválido: ' + (e?.message || 'JSON incorreto'));
    }
  };

  // Carrega arquivo através do input de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setImportText(content);
        processImportString(content);
      }
    };
    reader.onerror = () => {
      setImportError('Erro ao ler o arquivo selecionado.');
    };
    reader.readAsText(file);
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  // Aplica a restauração confirmada
  const handleConfirmRestore = () => {
    if (!previewData) return;
    const res = onImportSave(previewData.rawJson);
    if (res.ok) {
      sound.playCatch('legendary', 10);
      onShowToast(`Progresso de "${previewData.name}" restaurado com sucesso!`, 'success');
      onClose();
    } else {
      setImportError(res.error || 'Falha ao restaurar save.');
      onShowToast(res.error || 'Falha ao restaurar save.', 'warning');
    }
  };

  // Executa o reset de fábrica do save
  const handleConfirmReset = () => {
    onResetSave();
    setConfirmReset(false);
    onShowToast('Jogo reiniciado com sucesso!', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                Gerenciar Save & Backup
              </h2>
              <p className="text-xs text-slate-400">
                Exporte seu progresso para não perder nada ou restaure um save anterior
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-3 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('export');
              setImportError(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'export'
                ? 'border-sky-500 text-sky-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Backup
          </button>

          <button
            onClick={() => {
              setActiveTab('import');
              setImportError(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'import'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Restaurar Backup
          </button>

          <button
            onClick={() => {
              setActiveTab('reset');
              setConfirmReset(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-lg transition-colors border-b-2 ml-auto ${
              activeTab === 'reset'
                ? 'border-red-500 text-red-400 bg-slate-800/60'
                : 'border-transparent text-slate-500 hover:text-red-400'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reiniciar
          </button>
        </div>

        {/* Conteúdo Dinâmico das Abas */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-300">
          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Resumo do Perfil Atual */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                    Nv.{player.level}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">{player.name}</h4>
                    <p className="text-xs text-slate-400">
                      {player.stats?.totalFishCaught ?? 0} peixes capturados • {player.inventory?.fish?.length ?? 0} no cesto
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-amber-400 flex items-center gap-1 justify-end">
                    <Coins className="w-3.5 h-3.5" />
                    {player.coins.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[11px] text-purple-400">
                    {player.cosmicScales ?? 0} Escamas Cósmicas
                  </div>
                </div>
              </div>

              <div className="bg-sky-950/30 border border-sky-800/40 rounded-xl p-3.5 text-xs text-sky-200/90 leading-relaxed">
                💡 <strong>Dica de Segurança:</strong> O arquivo de backup contém todo o seu progresso (itens, aquário, talentos, conquistas e moedas). Salve uma cópia antes de limpar o histórico do navegador!
              </div>

              {/* Botões de Ação de Exportação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleDownloadFile}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 font-bold text-white shadow-lg shadow-sky-950/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  Baixar Arquivo .JSON
                </button>

                <button
                  onClick={handleCopyJson}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                  {copied ? 'Copiado para Área!' : 'Copiar Texto JSON'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Zona de Drop / Carregamento de Arquivo */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 bg-slate-950/50 hover:bg-emerald-950/10 rounded-xl p-5 text-center cursor-pointer transition-all group"
              >
                <Upload className="w-8 h-8 mx-auto text-slate-500 group-hover:text-emerald-400 mb-2 transition-colors" />
                <h4 className="font-semibold text-slate-200 group-hover:text-emerald-300">
                  Clique aqui para selecionar seu arquivo .JSON
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ou selecione um backup baixado anteriormente
                </p>
              </div>

              {/* Área para Colar Código JSON */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Ou cole o conteúdo JSON diretamente:
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    if (e.target.value.trim()) {
                      processImportString(e.target.value);
                    } else {
                      setPreviewData(null);
                      setImportError(null);
                    }
                  }}
                  rows={3}
                  placeholder='{"game": "pescaria-retro-game", ...}'
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Mensagem de Erro de Importação */}
              {importError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Cartão de Pré-Visualização de Save Válido */}
              {previewData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      Backup Válido Detectado
                    </div>
                    {previewData.exportedAt && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(previewData.exportedAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500">Pescador:</span>{' '}
                      <strong className="text-slate-200">{previewData.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Nível:</span>{' '}
                      <strong className="text-sky-400">Nv. {previewData.level}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Moedas:</span>{' '}
                      <strong className="text-amber-400">{previewData.coins.toLocaleString('pt-BR')} 🪙</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Peixes:</span>{' '}
                      <strong className="text-slate-200">{previewData.fishCaught}</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmRestore}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Substituir e Restaurar Este Save
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'reset' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/50 text-xs text-red-200 space-y-2">
                <h4 className="font-bold flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Atenção: Reinício de Progresso
                </h4>
                <p>
                  Esta ação limpará todo o seu inventário, moedas, aquário, conquistas e talentos do navegador, iniciando uma nova pescaria do zero.
                </p>
                <p className="text-slate-400">
                  Recomendamos baixar um backup antes caso queira retornar ao estado atual no futuro.
                </p>
              </div>

              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="w-full py-3 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Desejo Reiniciar Todo o Progresso
                </button>
              ) : (
                <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-red-700">
                  <p className="text-xs text-red-400 font-bold text-center">
                    Tem certeza absoluta? Não há como desfazer sem um backup!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmReset}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 shadow-md shadow-red-950"
                    >
                      Sim, Resetar Tudo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/40 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
