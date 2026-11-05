import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GAMES, { APP_TITLE, APP_SUBTITLE } from './games-config';
import MapScreen from './MapScreen';
import mapSpots from './data/map-spots.json';

const FAV_KEY = '@gameguide/favorites';

function App() {
  const [screen, setScreen] = useState('home'); // home | game | detail
  const [gameId, setGameId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  useEffect(() => {
    AsyncStorage.getItem(FAV_KEY).then((v) => {
      if (v) {
        try { setFavorites(JSON.parse(v)); } catch (e) {}
      }
    });
  }, []);

  const toggleFavorite = async (key) => {
    let next;
    if (favorites.includes(key)) next = favorites.filter((x) => x !== key);
    else next = [...favorites, key];
    setFavorites(next);
    try { await AsyncStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch (e) {}
  };

  const c = dark ? darkColors : lightColors;

  if (screen === 'home') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <View style={styles.homeHeader}>
          <Text style={[styles.homeTitle, { color: c.title }]}>{APP_TITLE}</Text>
          <Text style={[styles.homeSub, { color: c.sub }]}>{APP_SUBTITLE}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.homeList}>
          {GAMES.map((g) => {
            const cnt = g.data.length;
            const favs = g.data.filter((d) => favorites.includes(`${g.id}-${d.id}`)).length;
            return (
              <TouchableOpacity
                key={g.id}
                activeOpacity={0.85}
                style={[styles.gameCard, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => { if (g.id === 'map') { setScreen('map'); } else { setGameId(g.id); setScreen('game'); } }}
              >
                <View style={[styles.gameIconWrap, { backgroundColor: g.deep }]}>
                  <Text style={styles.gameIcon}>{g.icon}</Text>
                </View>
                <View style={styles.gameInfo}>
                  <Text style={[styles.gameName, { color: c.title }]}>{g.name}</Text>
                  <Text style={[styles.gameSub, { color: g.color }]}>{g.sub}</Text>
                  <Text style={[styles.gameMeta, { color: c.sub }]}>
                    {cnt} 条攻略 · {favs > 0 ? `已收藏 ${favs}` : '点击进入'}
                  </Text>
                </View>
                <Text style={[styles.gameArrow, { color: c.sub }]}>›</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'map') {
    const mapGame = GAMES.find((x) => x.id === 'map');
    return <MapScreen spots={mapSpots} game={mapGame} onBack={() => setScreen('home')} />;
  }

  if (screen === 'detail' && selected) {
    const g = GAMES.find((x) => x.id === selected.game);
    const key = `${selected.game}-${selected.id}`;
    const isFav = favorites.includes(key);
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <View style={[styles.detailHeader, { borderColor: c.border }]}>
          <TouchableOpacity onPress={() => setScreen('game')} style={styles.backBtn}>
            <Text style={[styles.backText, { color: g.deep }]}>‹ 返回</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleFavorite(key)}
            style={[styles.favBtn, { borderColor: g.color }, isFav && { backgroundColor: g.color }]}
          >
            <Text style={[styles.favBtnText, { color: isFav ? '#fff' : g.color }]}>
              {isFav ? '★ 已收藏' : '☆ 收藏'}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.detailBody}>
          <Text style={[styles.detailTitle, { color: c.title }]}>{selected.title}</Text>
          <View style={[styles.detailCatWrap, { backgroundColor: g.deep }]}>
            <Text style={styles.detailCat}>{g.name} {g.sub} · {selected.category}</Text>
          </View>
          {selected.summary ? (
            <Text style={[styles.detailSummary, { color: c.sub }]}>{selected.summary}</Text>
          ) : null}
          {selected.content.split('\n\n').map((para, i) => (
            <Text key={i} style={[styles.detailPara, { color: c.text }]}>{para.trim()}</Text>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const game = GAMES.find((x) => x.id === gameId);
  return (
    <GameScreen
      game={game}
      dark={dark}
      c={c}
      favorites={favorites}
      onBack={() => { setGameId(null); setScreen('home'); }}
      onOpen={(item) => { setSelected({ ...item, game: game.id }); setScreen('detail'); }}
    />
  );
}

function GameScreen({ game, dark, c, favorites, onBack, onOpen }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const [tab, setTab] = useState('browse'); // browse | favorites

  const cats = useMemo(() => {
    const s = new Set(game.data.map((d) => d.category));
    return ['全部', ...Array.from(s)];
  }, [game]);

  const filtered = useMemo(() => {
    let list = game.data;
    if (category !== '全部') list = list.filter((d) => d.category === category);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        (d.summary || '').toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        (d.tags || []).join(' ').toLowerCase().includes(q)
      );
    }
    return list;
  }, [game, query, category]);

  const favList = useMemo(
    () => game.data.filter((d) => favorites.includes(`${game.id}-${d.id}`)),
    [game, favorites]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <View style={[styles.gHeader, { backgroundColor: game.deep }]}>
        <TouchableOpacity onPress={onBack} style={styles.gBack}>
          <Text style={styles.gBackText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.gHeaderInfo}>
          <Text style={styles.gHeaderName}>{game.name}</Text>
          <Text style={styles.gHeaderSub}>{game.sub} · {game.data.length} 条攻略</Text>
        </View>
        <Text style={styles.gHeaderIcon}>{game.icon}</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={[styles.search, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
          placeholder="搜索攻略、物品、技巧…"
          placeholderTextColor={dark ? '#666' : '#999'}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {cats.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, { backgroundColor: c.chipBg }, category === cat && { backgroundColor: game.color }]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, { color: c.chipText }, category === cat && { color: '#fff', fontWeight: '700' }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {tab === 'browse' ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={[styles.empty, { color: c.sub }]}>没搜到相关内容 🦞</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => onOpen(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: c.title }]} numberOfLines={1}>{item.title}</Text>
                {favorites.includes(`${game.id}-${item.id}`) && <Text style={[styles.star, { color: game.color }]}>★</Text>}
              </View>
              <Text style={[styles.cardSummary, { color: c.sub }]} numberOfLines={2}>{item.summary}</Text>
              <View style={styles.cardFoot}>
                <Text style={[styles.cardCat, { color: game.deep }]}>{item.category}</Text>
                {(item.tags || []).slice(0, 3).map((t) => (
                  <Text key={t} style={[styles.tag, { backgroundColor: c.chipBg, color: c.chipText }]}>#{t}</Text>
                ))}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={favList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={[styles.empty, { color: c.sub }]}>还没有收藏，去浏览页点 ★ 收藏吧</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => onOpen(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: c.title }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.star, { color: game.color }]}>★</Text>
              </View>
              <Text style={[styles.cardSummary, { color: c.sub }]} numberOfLines={2}>{item.summary}</Text>
              <Text style={[styles.cardCat, { color: game.deep }]}>{item.category}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={[styles.tabbar, { borderColor: c.border, backgroundColor: c.card }]}>
        <TouchableOpacity style={[styles.tab, tab === 'browse' && { borderTopColor: game.color, borderTopWidth: 3 }]} onPress={() => setTab('browse')}>
          <Text style={[styles.tabText, { color: c.sub }, tab === 'browse' && { color: game.color, fontWeight: '700' }]}>浏览</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'favorites' && { borderTopColor: game.color, borderTopWidth: 3 }]} onPress={() => setTab('favorites')}>
          <Text style={[styles.tabText, { color: c.sub }, tab === 'favorites' && { color: game.color, fontWeight: '700' }]}>
            收藏（{favList.length}）
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const lightColors = {
  bg: '#F6F3EC',
  card: '#FFFFFF',
  border: '#ECE6D8',
  title: '#2A2520',
  sub: '#8A7F6E',
  text: '#3A342C',
  chipBg: '#EFE9DC',
  chipText: '#7A7060',
};

const darkColors = {
  bg: '#17161B',
  card: '#23222A',
  border: '#33313C',
  title: '#EDE9E2',
  sub: '#9A9184',
  text: '#D6D0C6',
  chipBg: '#2E2C36',
  chipText: '#B0A896',
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  homeHeader: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 8 },
  homeTitle: { fontSize: 30, fontWeight: '800' },
  homeSub: { fontSize: 14, marginTop: 6 },
  homeList: { padding: 20, paddingBottom: 32 },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  gameIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gameIcon: { fontSize: 30 },
  gameInfo: { flex: 1 },
  gameName: { fontSize: 19, fontWeight: '800' },
  gameSub: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  gameMeta: { fontSize: 12, marginTop: 6 },
  gameArrow: { fontSize: 28, marginLeft: 8 },
  gHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  gBack: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  gBackText: { fontSize: 28, color: '#fff', fontWeight: '300' },
  gHeaderInfo: { flex: 1, marginLeft: 4 },
  gHeaderName: { fontSize: 19, fontWeight: '800', color: '#fff' },
  gHeaderSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  gHeaderIcon: { fontSize: 26 },
  searchWrap: { paddingHorizontal: 16, marginTop: 12 },
  search: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
    borderWidth: 1,
  },
  chipsWrap: { marginTop: 12, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, marginLeft: 12 },
  chipText: { fontSize: 13 },
  list: { padding: 16, paddingBottom: 24 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  star: { fontSize: 16 },
  cardSummary: { fontSize: 13, marginTop: 6, lineHeight: 19 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 10 },
  cardCat: { fontSize: 12, fontWeight: '700', marginRight: 10 },
  tag: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 6, marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 44, fontSize: 15 },
  tabbar: { flexDirection: 'row', borderTopWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { fontSize: 15 },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  backText: { fontSize: 16, fontWeight: '700' },
  favBtn: { borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 },
  favBtnText: { fontSize: 14, fontWeight: '700' },
  detailBody: { padding: 20, paddingBottom: 40 },
  detailTitle: { fontSize: 26, fontWeight: '800', lineHeight: 34 },
  detailCatWrap: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, marginTop: 12 },
  detailCat: { fontSize: 12, color: '#fff', fontWeight: '700' },
  detailSummary: { fontSize: 14, marginTop: 14, lineHeight: 22 },
  detailPara: { fontSize: 15, lineHeight: 25, marginTop: 14 },
});

export default App;
