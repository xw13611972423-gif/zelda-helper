import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText, Polygon, Ellipse } from 'react-native-svg';

const TYPE_COLORS = {
  城堡: '#1E5B8E',
  神殿: '#6B4A9E',
  村庄: '#3E8E4E',
  鸟望台: '#D4A017',
  驿站: '#B8860B',
  地标: '#7A7060',
};

const MAJOR_TYPES = ['城堡', '神殿', '村庄']; // 显示名称的类型

// 区域色块
const REGIONS = [
  { points: '90,70 160,60 170,130 130,160 80,150', color: '#E3ECF4' }, // 海布拉（雪）
  { points: '80,150 130,160 140,220 90,220', color: '#E8E3CE' }, // 塔邦达
  { points: '60,240 140,220 150,330 50,340', color: '#F2E6C4' }, // 格鲁德（沙漠）
  { points: '140,140 260,140 260,240 140,240', color: '#DEEBD8' }, // 中央海拉鲁
  { points: '140,240 260,240 260,340 150,340', color: '#CDE6C0' }, // 费罗尼（森林）
  { points: '260,240 360,240 350,340 260,340', color: '#CFE8DC' }, // 法隆
  { points: '260,140 360,140 360,230 260,230', color: '#CBE2F2' }, // 拉聂尔（水域）
  { points: '300,60 380,60 380,140 300,140', color: '#EADCCC' }, // 阿卡莱
  { points: '250,60 300,60 300,140 250,140', color: '#F4DCC0' }, // 奥尔丁（火山）
];

function MapScreen({ spots, onBack, game }) {
  const [filter, setFilter] = useState('全部');
  const [selected, setSelected] = useState(null);

  const types = ['全部', '城堡', '神殿', '村庄', '鸟望台', '驿站', '地标'];
  const filtered = filter === '全部' ? spots : spots.filter((s) => s.type === filter);
  const typeCount = (t) => spots.filter((s) => s.type === t).length;

  return (
    <View style={styles.wrap}>
      <View style={[styles.header, { backgroundColor: game.deep }]}>
        <TouchableOpacity onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>海拉鲁地图</Text>
          <Text style={styles.headerSub}>{spots.length} 个地点 · 点击标记查看详情</Text>
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
              <Text style={[styles.chipText, filter === t && { color: '#fff', fontWeight: '700' }]}>
                {t === '全部' ? '全部' : `${t} ${typeCount(t)}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.mapWrap}>
        <Svg viewBox="0 0 400 400" width="100%" height="100%">
          {/* 海洋背景 */}
          <Path
            d="M50,340 C45,260 60,200 90,160 C100,70 170,50 250,60 C320,55 380,80 380,140 C375,220 360,260 350,340 C340,355 60,355 50,340 Z"
            fill="#A8CFE8"
            stroke="#6E94A8"
            strokeWidth="3"
          />
          {/* 海拉鲁陆地（略小于海洋，形成海岸线） */}
          <Path
            d="M58,338 C52,258 66,200 95,162 C104,74 172,56 250,66 C318,60 374,84 374,140 C369,218 354,258 344,338 C334,352 68,352 58,338 Z"
            fill="#F5EEDC"
            stroke="#B8A88A"
            strokeWidth="2.5"
          />
          {/* 区域色块 */}
          {REGIONS.map((r) => (
            <Polygon key={r.points} points={r.points} fill={r.color} stroke="#C0B090" strokeWidth="1" opacity={0.9} />
          ))}
          {/* 拉聂尔湖 */}
          <Ellipse cx="290" cy="208" rx="26" ry="14" fill="#9CC8E8" stroke="#7AA8C8" strokeWidth="1.5" />
          {/* 海拉鲁河 */}
          <Path d="M180,140 C190,160 185,180 200,195 C215,210 210,230 205,245" fill="none" stroke="#9CC8E8" strokeWidth="4" strokeLinecap="round" />
          {/* 死亡之山火山口 */}
          <Ellipse cx="282" cy="55" rx="18" ry="8" fill="#E8A060" stroke="#C88040" strokeWidth="1.5" />
          {/* 标记点 */}
          {filtered.map((s) => {
            const isMajor = MAJOR_TYPES.includes(s.type);
            const isSel = selected && selected.id === s.id;
            return (
              <G key={s.id} onPress={() => setSelected(s)}>
                <Circle
                  cx={s.x}
                  cy={s.y}
                  r={isSel ? 10 : isMajor ? 7 : 5}
                  fill={TYPE_COLORS[s.type] || '#888'}
                  stroke="#fff"
                  strokeWidth={2}
                />
                {isMajor && (
                  <SvgText x={s.x + 10} y={s.y + 3} fontSize={8.5} fill="#4A3A28" fontWeight="600">
                    {s.name}
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      </View>

      {selected ? (
        <View style={styles.detail}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailType, { color: TYPE_COLORS[selected.type] || '#888' }]}>{selected.type}</Text>
            <Text style={styles.detailRegion}>{selected.region}</Text>
          </View>
          <Text style={styles.detailName}>{selected.name}</Text>
          <Text style={styles.detailDesc}>{selected.desc}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
            <Text style={styles.closeText}>关闭</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.legend}>
          {Object.entries(TYPE_COLORS).map(([t, c]) => (
            <View key={t} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: c }]} />
              <Text style={styles.legendText}>{t}</Text>
            </View>
          ))}
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
  chips: { marginVertical: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 16, backgroundColor: '#EFE9DC', marginLeft: 10 },
  chipText: { fontSize: 12, color: '#7A7060' },
  mapWrap: { flex: 1, marginHorizontal: 8, backgroundColor: '#D8E8F0', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#C8D4DC' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginVertical: 3 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  legendText: { fontSize: 11, color: '#7A7060' },
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
