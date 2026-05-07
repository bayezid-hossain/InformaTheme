import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { useDates } from '../../context/DateStoreContext';
import { useTheme } from '../../hooks/useTheme';
import { useAlert } from '../../hooks/useAlert';
import { Calendar, Trash2, Archive } from 'lucide-react-native';
import { format } from 'date-fns';

function safeFormatDate(isoStr: string, formatStr: string = 'MMM d, yyyy') {
  try {
    if (!isoStr) return 'N/A';
    const dateObj = new Date(isoStr);
    if (isNaN(dateObj.getTime())) {
      // Fallback split parsing
      const parts = isoStr.split(/[-T :.Z]/);
      if (parts.length >= 3) {
        const parsed = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (!isNaN(parsed.getTime())) {
          return format(parsed, formatStr);
        }
      }
      return isoStr;
    }
    return format(dateObj, formatStr);
  } catch (e) {
    return isoStr || 'N/A';
  }
}

export function HistoryScreen() {
  const { colors } = useTheme();
  const { history, restoreDate, clearHistory } = useDates();
  const { showAlert } = useAlert();

  // Group history by created date formatted as "MMMM d, yyyy"
  const grouped = React.useMemo(() => {
    const groups: Record<string, typeof history> = {};
    
    // Sort history by created time (most recently created first)
    const sorted = [...history].sort((a, b) => {
      const timeA = a.createdAtISO ? new Date(a.createdAtISO).getTime() : 0;
      const timeB = b.createdAtISO ? new Date(b.createdAtISO).getTime() : 0;
      const validA = isNaN(timeA) ? 0 : timeA;
      const validB = isNaN(timeB) ? 0 : timeB;
      return validB - validA;
    });

    sorted.forEach((item) => {
      let dateStr = 'Unknown Date';
      try {
        dateStr = safeFormatDate(item.createdAtISO, 'MMMM d, yyyy');
      } catch (e) {
        console.error('Failed to parse date:', e);
      }
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(item);
    });

    return Object.entries(groups);
  }, [history]);

  function handleRestore(item: any) {
    showAlert('Restore Item', `Do you want to restore "${item.label}" back to your active list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', onPress: () => restoreDate(item) },
    ]);
  }

  function handleClearAll() {
    if (history.length === 0) return;
    showAlert('Clear History', 'Are you sure you want to permanently clear all history entries? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => clearHistory() },
    ]);
  }


  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <TopBar 
        title="History & Archive" 
        rightElement={history.length > 0 ? (
          <TouchableOpacity onPress={handleClearAll} className="w-10 h-10 justify-center items-end">
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        ) : undefined}
      />

      <ScrollView className="flex-1 px-4 py-3" showsVerticalScrollIndicator={false}>
        {history.length === 0 ? (
          <View className="flex-1 justify-center items-center py-24">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: colors.border, borderWidth: 1 }}>
              <Archive size={28} color={colors.text3} />
            </View>
            <Text className="text-sm font-semibold text-center" style={{ color: colors.text2 }}>
              No history found
            </Text>
            <Text className="text-xs mt-1 text-center max-w-[250px] leading-relaxed" style={{ color: colors.text3 }}>
              Completed lockscreen todos, expired items, and deleted anchor dates will appear here.
            </Text>
          </View>
        ) : (
          grouped.map(([createdDate, items]) => (
            <View key={createdDate} className="mb-6">
              <View className="flex-row items-center gap-2 mb-3 px-1">
                <Calendar size={12} color={colors.text3} />
                <Text className="text-[11px] font-bold tracking-[1.2px] uppercase" style={{ color: colors.text3 }}>
                  Created on {createdDate}
                </Text>
              </View>
              
              <View className="rounded-2xl border overflow-hidden" style={{ backgroundColor: colors.bg2, borderColor: colors.border }}>
                {items.map((item, idx) => {
                  const isTodo = item.type === 'todo';
                  const isFailed = item.status === 'failed';
                  const statusColor = isFailed ? '#EF4444' : '#10B981';
                  
                  return (
                    <TouchableOpacity 
                      key={item.id} 
                      onPress={() => handleRestore(item)} 
                      activeOpacity={0.7}
                    >
                      {idx > 0 && <View className="h-px ml-14" style={{ backgroundColor: colors.border }} />}
                      
                      <View className="flex-row items-center px-4 py-4 gap-3.5">
                        {/* Icon Container with beautiful glass style */}
                        <View className="w-10 h-10 rounded-xl justify-center items-center border" style={{ backgroundColor: 'rgba(255,255,255,0.01)', borderColor: colors.border }}>
                          <Text className="text-lg">{item.icon || '⭐'}</Text>
                        </View>
                        
                        <View className="flex-1">
                          <View className="flex-row items-center gap-1.5 flex-wrap">
                            <Text className="text-[15px] font-bold" style={{ color: colors.text }}>{item.label}</Text>
                          </View>
                          
                          <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                            <Text className="text-[10px]" style={{ color: colors.text3 }}>
                              Target: {safeFormatDate(item.dateISO)}
                            </Text>
                            <Text className="text-[10px]" style={{ color: colors.text3 }}>•</Text>
                            <Text className="text-[10px]" style={{ color: colors.text3 }}>
                              {isFailed ? 'Expired: ' : 'Completed: '}{safeFormatDate(item.deletedAtISO)}
                            </Text>
                          </View>

                          {/* Beautiful Status Badge for Todos */}
                          {isTodo && (
                            <View 
                              className="px-2 py-[3px] rounded-md flex-row items-center gap-1 mt-1.5 self-start" 
                              style={{ backgroundColor: `${statusColor}15` }}
                            >
                              <View 
                                className="w-1.5 h-1.5 rounded-full" 
                                style={{ backgroundColor: statusColor }} 
                              />
                              <Text 
                                className="text-[9px] font-extrabold uppercase tracking-[0.5px]" 
                                style={{ color: statusColor }}
                              >
                                {isFailed ? 'Expired / Failed' : 'Completed'}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
