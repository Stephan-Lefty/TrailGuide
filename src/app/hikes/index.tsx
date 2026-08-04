import * as MailComposer from 'expo-mail-composer';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { writeGpxFile } from '../../services/gpx/gpxExport';
import { listPastHikes } from '../../services/hike/hikeRepository';
import { deleteTrackPoints, listTrackPoints } from '../../services/hike/trackPointsRepository';
import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize, radius } from '../../theme/typography';
import type { Hike } from '../../types/hike';
import type { TrackPoint } from '../../types/location';

interface HikeEntry {
  hike: Hike;
  points: TrackPoint[];
}

function formatDuration(startedAt: number, endedAt: number | null): string {
  if (!endedAt) return '';
  const totalSeconds = Math.round((endedAt - startedAt) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} min ${seconds} s` : `${seconds} s`;
}

export default function HikesListScreen() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<HikeEntry[] | null>(null);

  const load = useCallback(() => {
    const hikes = listPastHikes().filter((hike) => hike.status === 'ended_incident');
    const withPoints = hikes
      .map((hike) => ({ hike, points: listTrackPoints(hike.id) }))
      .filter((entry) => entry.points.length > 0);
    setEntries(withPoints);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMail(entry: HikeEntry) {
    const available = await MailComposer.isAvailableAsync();
    if (!available) {
      Alert.alert(t('hikesList.mailUnavailableTitle'), t('hikesList.mailUnavailableBody'));
      return;
    }
    const { uri } = await writeGpxFile(entry.hike, entry.points);
    await MailComposer.composeAsync({
      subject: t('hikesList.mailSubject', { date: new Date(entry.hike.startedAt).toLocaleDateString() }),
      body: t('hikesList.mailBody'),
      attachments: [uri],
    });
  }

  async function handleShare(entry: HikeEntry) {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert(t('hikesList.shareUnavailableTitle'), t('hikesList.shareUnavailableBody'));
      return;
    }
    const { uri } = await writeGpxFile(entry.hike, entry.points);
    await Sharing.shareAsync(uri, { mimeType: 'application/gpx+xml', dialogTitle: t('hikesList.shareDialogTitle') });
  }

  function handleDelete(entry: HikeEntry) {
    Alert.alert(t('hikesList.deleteConfirmTitle'), t('hikesList.deleteConfirmBody'), [
      { text: t('hike.cancel'), style: 'cancel' },
      {
        text: t('hikesList.delete'),
        style: 'destructive',
        onPress: () => {
          deleteTrackPoints(entry.hike.id);
          load();
        },
      },
    ]);
  }

  function handleDeleteAll() {
    if (!entries || entries.length === 0) return;
    Alert.alert(t('hikesList.deleteAllConfirmTitle'), t('hikesList.deleteAllConfirmBody'), [
      { text: t('hike.cancel'), style: 'cancel' },
      {
        text: t('hikesList.deleteAll'),
        style: 'destructive',
        onPress: () => {
          entries.forEach((entry) => deleteTrackPoints(entry.hike.id));
          load();
        },
      },
    ]);
  }

  if (entries === null) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {entries.length === 0 ? (
        <Text style={styles.empty}>{t('hikesList.empty')}</Text>
      ) : (
        <>
          <Pressable
            onPress={handleDeleteAll}
            style={({ pressed }) => [styles.deleteAllButton, pressed && styles.pressed]}
          >
            <Text style={styles.deleteAllButtonText}>{t('hikesList.deleteAll')}</Text>
          </Pressable>
          {entries.map((entry) => {
            const dateLabel = new Date(entry.hike.startedAt).toLocaleDateString();
            const startTime = new Date(entry.hike.startedAt).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });
            const endTime = entry.hike.endedAt
              ? new Date(entry.hike.endedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
              : '';
            return (
              <View key={entry.hike.id} style={styles.card}>
                <Text style={styles.date} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {t('hikesList.activityLine', { date: dateLabel, start: startTime, end: endTime })}
                </Text>
                <Text style={styles.meta}>
                  {formatDuration(entry.hike.startedAt, entry.hike.endedAt)}
                  {' · '}
                  {t('hikesList.pointCount', { count: entry.points.length })}
                </Text>
                <View style={styles.actionsRow}>
                  <Pressable
                    onPress={() => handleMail(entry)}
                    style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.actionButtonText}>{t('hikesList.actionMail')}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleShare(entry)}
                    style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.actionButtonText}>{t('hikesList.actionShare')}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(entry)}
                    style={({ pressed }) => [styles.actionButtonDanger, pressed && styles.pressed]}
                  >
                    <Text style={styles.actionButtonDangerText}>{t('hikesList.actionDelete')}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.background,
  },
  content: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 16,
  },
  empty: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    color: semanticColors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },
  deleteAllButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  deleteAllButtonText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    fontWeight: '600',
    color: semanticColors.danger,
  },
  card: {
    backgroundColor: semanticColors.surface,
    borderRadius: radius.medium,
    padding: 16,
    gap: 4,
  },
  date: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.small,
    color: semanticColors.textPrimary,
  },
  meta: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: semanticColors.primary,
    borderRadius: radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  actionButtonDanger: {
    flex: 1,
    backgroundColor: semanticColors.background,
    borderRadius: radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: semanticColors.danger,
  },
  actionButtonDangerText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    fontWeight: '700',
    color: semanticColors.danger,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
