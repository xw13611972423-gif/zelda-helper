import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText, Polygon } from 'react-native-svg';

const TYPE_COLORS = {
  城堡: '#1E5B8E',
  神殿: '#6B4A9E',
  村庄: '#4C9A4C',
  地标: '#C07A2E',
};

const REGIONS = [
  { name: '海布拉', points: '90,70 160,60 170,130 130,160 80,150', color: '#CFE3F0' },
  { name: '塔邦达', points: '80,150 130,160 140,220 90,220', color: '#E6E0C8' },
  { name: '格鲁德', points: '60,240 140,220 150,330 50,340', color: '#F0E2C0' },
  { name: '中央海拉鲁', points: '140,140 260,140 260,240 140,240', color: '#DCEBD4' },
  { name: '费罗尼', points: '140,240 260,240 260,340 150,340', color: '#CDE6C0' },
  { name: '法隆', points: '260,240 360,240 350,340 260,340', color: '#CFE8DC' },
  { name: '拉聂尔', points: '260,140 360,140 360,230 260,230', color: '#C8E0F0' },
  { name: '阿卡莱', points: '300,60 380,60 380,140 300,140', color: '#E8D8C8' },
  { name: '奥尔丁', points: '250,60 300,60 300,140 250,140', color: '#F0D8C0' },
];

function MapScreen({ spots, onBack, game }) {
  const [filter, setFilter] = useState('全部');
  const [selected, setSelected] = useState(null);

  const types = ['全部', '城堡', '神殿', '村庄', '地标'];
  const filtered = filter === '全部' ? spots : spots.filter((s) => s.type === filter);

  return (
    <View style={styles.wrap}>
      <View style={[styles.header, { backgroundColor: game.deep }]}>
        <TouchableOpacity onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>海拉鲁地图</Text>
          <Text style={styles.headerSub}>点击标记查看地点</Text>
        </View>
        <Text style={styles.headerIcon}>🗺️</Text>
      </View>

      <View style={styles.chips}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {types.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, filter === t && { backgroundColor: game.color }]}
              onPress={() => setFilter(t)}
            >
              <Text style={[styles.chipText, filter === t && { color: '#fff', fontWeight: '700' }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.mapWrap}>
        <Svg viewBox="0 0 400 400" width="100%" height="100%">
          {/* 海拉鲁陆地轮廓 */}
          <Path
            d="M50,340 C45,260 60,200 90,160 C100,70 170,50 250,60 C320,55 380,80 380,140 C375,220 360,260 350,340 C340,355 60,355 50,340 Z"
            fill="#F5EEDC"
            stroke="#B8A88A"
            strokeWidth="3"
          />
          {/* 区域色块 */}
          {REGIONS.map((r) => (
            <Polygon key={r.name} points={r.points} fill={r.color} stroke="#C0B090" strokeWidth="1" opacity={0.85} />
          ))}
          {/* 标记点 */}
          {filtered.map((s) => (
            <G key={s.id} onPress={() => setSelected(s)}>
              <Circle cx={s.x} cy={s.y} r={selected && selected.id === s.id ? 11 : 8} fill={TYPE_COLORS[s.type] || '#888'} stroke="#fff" strokeWidth={2} />
              <SvgText x={s.x + 12} y={s.y + 3} fontSize={9} fill="#4A3A28" fontWeight="600">{s.name}</SvgText>
            </G>
          ))}
        </Svg>
      </View>

      {selected ? (
        <View style={styles.detail}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailType, { color: TYPE_COLORS[selected.type] }]}>{selected.type}</Text>
            <Text style={styles.detailRegion}>{selected.region}</Text>
          </View>
          <Text style={styles.detailName}>{selected.name}</Text>
          <Text style={styles.detailDesc}>{selected.desc}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
            <Text style={styles.closeText}>关闭</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.hint}>
          <Text style={styles.hintText}>共 {filtered.length} 个地点 · 点击地图上的标记查看详情</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#F6F3EC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 28, color: '#fff', fontWeight: '300' },
  headerInfo: { flex: 1, marginLeft: 4 },
  headerName: { fontSize: 19, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerIcon: { fontSize: 24 },
  chips: { marginVertical: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, backgroundColor: '#EFE9DC', marginLeft: 12 },
  chipText: { fontSize: 13, color: '#7A7060' },
  mapWrap: { flex: 1, marginHorizontal: 8, backgroundColor: '#E8EFF4', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#D8CBB4' },
  hint: { padding: 14, alignItems: 'center' },
  hintText: { fontSize: 13, color: '#8A7F6E' },
  detail: {
    margin: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE6D8',
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  detailType: { fontSize: 12, fontWeight: '700' },
  detailRegion: { fontSize: 12, color: '#8A7F6E' },
  detailName: { fontSize: 20, fontWeight: '800', color: '#2A2520', marginBottom: 6 },
  detailDesc: { fontSize: 14, color: '#6B5540', lineHeight: 21 },
  closeBtn: { alignSelf: 'flex-end', marginTop: 10, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, backgroundColor: '#EFE9DC' },
  closeText: { fontSize: 13, color: '#7A7060', fontWeight: '600' },
});

export default MapScreen;
