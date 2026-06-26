import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFIL_KEY = '@profilecard_data';

export default function App() {
  const [foto, setFoto] = useState(null);      
  const [nama, setNama] = useState('');         
  const [lokasi, setLokasi] = useState(null);   
  const [loading, setLoading] = useState(false); 

  // Muat profil lama dari AsyncStorage saat aplikasi dibuka (Materi P12)
  useEffect(() => {
    async function muatProfil() {
      try {
        const json = await AsyncStorage.getItem(PROFIL_KEY);
        if (json != null) {
          const data = JSON.parse(json);
          setFoto(data.foto);
          setNama(data.nama);
        }
      } catch (e) {
        console.log('Gagal memuat profil:', e);
      }
    }
    muatProfil();
  }, []);

  // Simpan data profil ke penyimpanan lokal
  async function simpanProfil() {
    try {
      const data = JSON.stringify({ foto, nama });
      await AsyncStorage.setItem(PROFIL_KEY, data);
      Alert.alert('Tersimpan! 💾', 'Profil kamu berhasil disimpan secara lokal.');
    } catch (e) {
      console.log('Gagal menyimpan profil:', e);
      Alert.alert('Error', 'Gagal menyimpan data profil.');
    }
  }

  // Ambil foto menggunakan Kamera HP
  async function ambilFoto() {
    const izin = await ImagePicker.requestCameraPermissionsAsync();

    if (izin.status !== 'granted') {
      Alert.alert('Izin Ditolak 🛡️', 'Aplikasi butuh izin kamera untuk mengambil foto.');
      return;
    }

    const hasil = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.7,   
    });

    if (!hasil.canceled) {
      setFoto(hasil.assets[0].uri);
    }
  }

  // Pilih foto dari Galeri HP
  async function pilihDariGaleri() {
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (izin.status !== 'granted') {
      Alert.alert('Izin Ditolak 🛡️', 'Aplikasi butuh izin galeri untuk memilih foto.');
      return;
    }

    const hasil = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!hasil.canceled) {
      setFoto(hasil.assets[0].uri);
    }
  }

  // Memunculkan opsi pilihan Kamera atau Galeri (UX Instagram Style)
  function ubahFoto() {
    Alert.alert(
      'Ubah Foto Profil 📸',
      'Silakan pilih sumber foto kamu:',
      [
        { text: '📸 Ambil via Kamera', onPress: ambilFoto },
        { text: '🖼️ Pilih dari Galeri', onPress: pilihDariGaleri },
        { text: 'Batal', style: 'cancel' },
      ]
    );
  }

  // Mendeteksi koordinat GPS current position
  async function ambilLokasi() {
    const izin = await Location.requestForegroundPermissionsAsync();

    if (izin.status !== 'granted') {
      Alert.alert('Izin Ditolak 🛡️', 'Aplikasi butuh izin lokasi untuk fitur ini.');
      return;
    }

    setLoading(true); 

    try {
      const posisi = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLokasi({
        latitude: posisi.coords.latitude,
        longitude: posisi.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error GPS', 'Gagal mendapatkan lokasi. Pastikan GPS HP kamu aktif.');
    } finally {
      setLoading(false); 
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>👤 ProfileCard</Text>

      <View style={styles.card}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarKosong]}>
            <Text style={{ fontSize: 40 }}>📷</Text>
          </View>
        )}

        <TextInput
          style={styles.inputNama}
          placeholder="Masukkan nama..."
          value={nama}
          onChangeText={setNama}
          textAlign="center"
        />

        <TouchableOpacity style={styles.btn} onPress={ubahFoto}>
          <Text style={styles.btnText}>✏️ Ubah Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: '#0984e3' }]} 
          onPress={ambilLokasi}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? 'Mencari Lokasi...' : '📍 Lokasi Saya'}
          </Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="small" color="#0984e3" style={{ marginTop: 10 }} />}
        
        {lokasi && !loading && (
          <Text style={styles.koordinat}>
            Posisi: {lokasi.latitude.toFixed(5)}, {lokasi.longitude.toFixed(5)}
          </Text>
        )}

        <View style={styles.separator} />

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: '#6c5ce7', marginTop: 5 }]} 
          onPress={simpanProfil}
        >
          <Text style={styles.btnText}>💾 Simpan Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0a2e0a', marginBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    alignItems: 'center', width: '85%',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6,
  },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  avatarKosong: {
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#00b894', borderStyle: 'dashed',
  },
  inputNama: {
    fontSize: 18, fontWeight: '600', color: '#0a2e0a',
    borderBottomWidth: 1, borderBottomColor: '#ddd', width: '80%', paddingVertical: 6, marginBottom: 10,
  },
  btn: { backgroundColor: '#00b894', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, marginTop: 12, width: '85%' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, textAlign: 'center' },
  koordinat: { marginTop: 12, fontSize: 13, color: '#0984e3', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#eee', width: '90%', marginVertical: 16 }
});