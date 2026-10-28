import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@quicknotes_notes_v1';
const COLORS = [
  '#FFF1B8',
  '#DDF7E8',
  '#DCEBFF',
  '#F9DDF0',
  '#F1E3FF',
  '#FFFFFF',
];

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadNotes() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setNotes(JSON.parse(saved));
        }
      } catch {
        Alert.alert(
          'Could not load notes',
          'Please reopen the app and try again.'
        );
      } finally {
        setLoaded(true);
      }
    }

    loadNotes();
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notes)
      ).catch(() => {
        Alert.alert(
          'Save issue',
          'Your latest changes could not be saved.'
        );
      });
    }
  }, [notes, loaded]);

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...notes]
      .filter(
        note =>
          !query ||
          `${note.title} ${note.body}`
            .toLowerCase()
            .includes(query)
      )
      .sort(
        (a, b) =>
          Number(b.pinned) - Number(a.pinned) ||
          b.updatedAt - a.updatedAt
      );
  }, [notes, search]);

  function openNewNote() {
    setEditingId(null);
    setTitle('');
    setBody('');
    setColor(COLORS[0]);
    setModalVisible(true);
  }

  function openEditNote(note) {
    setEditingId(note.id);
    setTitle(note.title);
    setBody(note.body);
    setColor(note.color);
    setModalVisible(true);
  }

  async function saveNote() {
    if (saving) return;

    if (!title.trim() && !body.trim()) {
      Alert.alert(
        'Empty note',
        'Please type a title or some note text.'
      );
      return;
    }

    Keyboard.dismiss();
    setSaving(true);

    const now = Date.now();

    const updatedNotes = editingId
      ? notes.map(note =>
          note.id === editingId
            ? {
                ...note,
                title: title.trim() || 'Untitled note',
                body: body.trim(),
                color,
                updatedAt: now,
              }
            : note
        )
      : [
          {
            id: `${now}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
            title: title.trim() || 'Untitled note',
            body: body.trim(),
            color,
            pinned: false,
            updatedAt: now,
          },
          ...notes,
        ];

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedNotes)
      );

      setNotes(updatedNotes);
      setModalVisible(false);
    } catch {
      Alert.alert(
        'Could not save note',
        'Please check your device storage and try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  function deleteNote(note) {
    Alert.alert(
      'Delete note?',
      `“${note.title}” will be removed from this device.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotes(current =>
              current.filter(item => item.id !== note.id)
            );
          },
        },
      ]
    );
  }

  function togglePin(note) {
    setNotes(current =>
      current.map(item =>
        item.id === note.id
          ? {
              ...item,
              pinned: !item.pinned,
              updatedAt: Date.now(),
            }
          : item
      )
    );
  }

  function renderNote({ item }) {
    return (
      <Pressable
        onPress={() => openEditNote(item)}
        style={[
          styles.noteCard,
          { backgroundColor: item.color },
        ]}
      >
        <View style={styles.noteTopRow}>
          <Text style={styles.noteTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Pressable
            onPress={() => togglePin(item)}
            hitSlop={10}
            accessibilityLabel={
              item.pinned ? 'Unpin note' : 'Pin note'
            }
          >
            <Text style={styles.pin}>
              {item.pinned ? '📌' : '○'}
            </Text>
          </Pressable>
        </View>

        {!!item.body && (
          <Text style={styles.noteBody} numberOfLines={7}>
            {item.body}
          </Text>
        )}

        <View style={styles.noteBottomRow}>
          <Text style={styles.noteDate}>
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>

          <Pressable
            onPress={() => deleteNote(item)}
            hitSlop={10}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F8FC"
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              YOUR PERSONAL SPACE
            </Text>

            <Text style={styles.heading}>
              QuickNotes
              <Text style={styles.headingDot}>.</Text>
            </Text>

            <Text style={styles.subheading}>
              Catch your thoughts, anytime.
            </Text>
          </View>

          <View style={styles.logo}>
            <Text style={styles.logoText}>✎</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search your notes..."
            placeholderTextColor="#8A91A4"
            style={styles.searchInput}
            returnKeyType="search"
          />

          {!!search && (
            <Pressable onPress={() => setSearch('')} hitSlop={10}>
              <Text style={styles.clearSearch}>×</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All notes</Text>

          <Text style={styles.count}>
            {visibleNotes.length}{' '}
            {visibleNotes.length === 1 ? 'note' : 'notes'}
          </Text>
        </View>

        {!loaded ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              Loading notes…
            </Text>
          </View>
        ) : visibleNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={{ fontSize: 30 }}>✎</Text>
            </View>

            <Text style={styles.emptyTitle}>
              {search ? 'No matching notes' : 'A fresh page'}
            </Text>

            <Text style={styles.emptyText}>
              {search
                ? 'Try another search term.'
                : 'Create your first note and keep ideas close.'}
            </Text>

            {!search && (
              <Pressable
                onPress={openNewNote}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>
                  Create a note
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <FlatList
            data={visibleNotes}
            keyExtractor={item => item.id}
            renderItem={renderNote}
            numColumns={2}
            columnWrapperStyle={styles.noteRow}
            contentContainerStyle={styles.notesList}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Pressable
          onPress={openNewNote}
          style={styles.fab}
          accessibilityLabel="Create new note"
          accessibilityRole="button"
        >
          <Text style={styles.fabPlus}>＋</Text>
          <Text style={styles.fabText}>New note</Text>
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          Keyboard.dismiss();
          setModalVisible(false);
        }}
      >
        <SafeAreaView style={styles.modalSafe}>
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={
              Platform.OS === 'ios' ? 'padding' : 'height'
            }
            keyboardVerticalOffset={
              Platform.OS === 'ios' ? 8 : 0
            }
          >
            <View style={styles.modalHeader}>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setModalVisible(false);
                }}
                hitSlop={12}
                style={styles.headerAction}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Text style={styles.modalTitle}>
                {editingId ? 'Edit note' : 'New note'}
              </Text>

              <Pressable
                onPress={saveNote}
                hitSlop={14}
                disabled={saving}
                style={[
                  styles.saveButton,
                  saving && styles.saveButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Save note"
              >
                <Text style={styles.saveText}>
                  {saving ? 'Saving…' : 'Save'}
                </Text>
              </Pressable>
            </View>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor="#8A91A4"
              style={styles.titleInput}
              maxLength={90}
              autoFocus
              returnKeyType="next"
            />

            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Write something worth remembering..."
              placeholderTextColor="#8A91A4"
              style={styles.bodyInput}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.colorLabel}>NOTE COLOUR</Text>

            <View style={styles.colorRow}>
              {COLORS.map(noteColor => (
                <Pressable
                  key={noteColor}
                  onPress={() => setColor(noteColor)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: noteColor },
                    color === noteColor && styles.colorSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${noteColor} note colour`}
                >
                  {color === noteColor && (
                    <Text style={styles.colorCheck}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={styles.localSaveHint}>
              Saved privately on this device
            </Text>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  eyebrow: {
    color: '#68718A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  heading: {
    color: '#17213D',
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 5,
  },

  headingDot: {
    color: '#6759E8',
  },

  subheading: {
    color: '#7B8398',
    fontSize: 13,
    marginTop: 4,
  },

  logo: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: '#EAE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    fontSize: 28,
    color: '#6759E8',
    fontWeight: '700',
  },

  searchBox: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECF4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 23,
  },

  searchIcon: {
    color: '#7A8297',
    fontSize: 25,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    color: '#17213D',
    fontSize: 14,
  },

  clearSearch: {
    color: '#7A8297',
    fontSize: 24,
    paddingLeft: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionTitle: {
    color: '#17213D',
    fontSize: 18,
    fontWeight: '800',
  },

  count: {
    color: '#858CA0',
    fontSize: 12,
    fontWeight: '600',
  },

  notesList: {
    paddingBottom: 110,
  },

  noteRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },

  noteCard: {
    flex: 1,
    minHeight: 145,
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7E9F0',
  },

  noteTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },

  noteTitle: {
    color: '#252B3D',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    lineHeight: 20,
  },

  pin: {
    color: '#6659D9',
    fontSize: 17,
  },

  noteBody: {
    color: '#4E566A',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9,
    flex: 1,
  },

  noteBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },

  noteDate: {
    color: '#7D8495',
    fontSize: 10,
  },

  deleteText: {
    color: '#9A5361',
    fontSize: 11,
    fontWeight: '700',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingBottom: 75,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EAE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    color: '#202943',
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    color: '#81889B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },

  emptyButton: {
    backgroundColor: '#6759E8',
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 18,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  fab: {
    position: 'absolute',
    bottom: 22,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6759E8',
    paddingHorizontal: 19,
    paddingVertical: 15,
    borderRadius: 18,
    elevation: 6,
    shadowColor: '#3328A8',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  fabPlus: {
    color: '#FFFFFF',
    fontSize: 22,
    marginRight: 8,
    marginTop: -2,
  },

  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  modalSafe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  modalContainer: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
  },

  modalHeader: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F6',
    marginBottom: 8,
  },

  headerAction: {
    minWidth: 62,
    minHeight: 44,
    justifyContent: 'center',
  },

  saveButton: {
    minWidth: 76,
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#6759E8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  cancelText: {
    color: '#737B90',
    fontSize: 14,
  },

  modalTitle: {
    color: '#202943',
    fontSize: 16,
    fontWeight: '800',
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  titleInput: {
    color: '#202943',
    fontSize: 25,
    fontWeight: '800',
    paddingVertical: 12,
  },

  bodyInput: {
    color: '#3E465A',
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    paddingTop: 12,
  },

  colorLabel: {
    color: '#858CA0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 14,
    marginBottom: 12,
  },

  colorRow: {
    flexDirection: 'row',
    gap: 13,
    marginBottom: 18,
  },

  colorDot: {
    width: 35,
    height: 35,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE1EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  colorSelected: {
    borderWidth: 2,
    borderColor: '#6759E8',
  },

  colorCheck: {
    color: '#393451',
    fontSize: 15,
    fontWeight: '900',
  },

  localSaveHint: {
    color: '#9298A8',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 12,
  },
});