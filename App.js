import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  // ESTADOS DA APLICAÇÃO
  const [currentScreen, setCurrentScreen] = useState('screen-login'); // Inicia no Login/Seleção
  const [role, setRole] = useState('dono'); // 'dono' ou 'produtor'
  const [activeTab, setActiveTab] = useState('inicio'); // 'inicio' ou 'perfil'

  // LISTA GLOBAL DE SILOS (Atualizada dinamicamente)
  const [silos, setSilos] = useState([
    {
      id: '1',
      nome: 'Silo Central A',
      localizacao: 'Rio Verde - GO',
      capacidade: '5000',
      graos: 'Soja, Milho',
      acesso: 'Bitrem, Rodotrem',
      inicio: '15/03',
      fim: '15/06/2026',
      latitude: -17.7922,
      longitude: -50.9192,
      dono: 'José Silva',
    },
    {
      id: '2',
      nome: 'Silo Oeste B',
      localizacao: 'Jataí - GO',
      capacidade: '8000',
      graos: 'Milho',
      acesso: 'Rodotrem',
      inicio: '01/04',
      fim: '30/08/2026',
      latitude: -17.8814,
      longitude: -51.7144,
      dono: 'Agro Silos Ltda',
    },
  ]);

  // Silo selecionado para ver detalhes no mapa ou leilão
  const [selectedSilo, setSelectedSilo] = useState(null);

  // Filtros de Busca (Produtor)
  const [filterCidade, setFilterCidade] = useState('');
  const [filterGrao, setFilterGrao] = useState('');

  // Formulário de Criação de Silo (Dono)
  const [formSilo, setFormSilo] = useState({
    nome: '',
    localizacao: '',
    capacidade: '',
    graos: '',
    acesso: '',
    inicio: '15/03',
    fim: '15/06/2026',
  });

  // NAVEGAÇÃO
  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  // ADICIONAR NOVO SILO (Ação do Dono)
  const handleCriarSilo = () => {
    if (!formSilo.nome || !formSilo.localizacao || !formSilo.capacidade) {
      Alert.alert('Erro', 'Por favor, preencha os campos principais do silo.');
      return;
    }

    // Coordenadas simuladas levemente variadas em Goiás para o mapa
    const randomLat = -17.7922 + (Math.random() - 0.5) * 0.5;
    const randomLng = -50.9192 + (Math.random() - 0.5) * 0.5;

    const novoSilo = {
      id: Date.now().toString(),
      nome: formSilo.nome,
      localizacao: formSilo.localizacao,
      capacidade: formSilo.capacidade,
      graos: formSilo.graos || 'Geral',
      acesso: formSilo.acesso || 'Todos',
      inicio: formSilo.inicio,
      fim: formSilo.fim,
      latitude: randomLat,
      longitude: randomLng,
      dono: 'Você (José Silva)',
    };

    // Atualiza a lista global de silos
    setSilos([novoSilo, ...silos]);
    setSelectedSilo(novoSilo);

    // Limpa formulário
    setFormSilo({
      nome: '',
      localizacao: '',
      capacidade: '',
      graos: '',
      acesso: '',
      inicio: '15/03',
      fim: '15/06/2026',
    });

    navigateTo('screen-anuncio-criado');
  };

  // SILOS FILTRADOS (Visão do Produtor/Busca)
  const silosFiltrados = silos.filter((silo) => {
    const matchCidade = silo.localizacao.toLowerCase().includes(filterCidade.toLowerCase());
    const matchGrao = silo.graos.toLowerCase().includes(filterGrao.toLowerCase());
    return matchCidade && matchGrao;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* CABEÇALHO COM OPÇÃO DE TROCAR PERFIL / SAIR */}
      <View style={styles.topHeader}>
        <Text style={styles.headerLogo}>GoSilo</Text>
        {currentScreen !== 'screen-login' && (
          <TouchableOpacity
            style={styles.switchRoleBtn}
            onPress={() => {
              setActiveTab('inicio');
              navigateTo('screen-login');
            }}
          >
            <Text style={styles.switchRoleText}>🔄 Trocar Perfil ({role === 'dono' ? 'Dono' : 'Produtor'})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ÁREA PRINCIPAL DAS TELAS */}
      <View style={styles.content}>
        {/* 1. TELA SELEÇÃO DE PERFIL / LOGIN UNIFICADO */}
        {currentScreen === 'screen-login' && (
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.mainTitle}>Bem-vindo ao GoSilo</Text>
              <Text style={styles.subtitle}>Escolha como deseja acessar a plataforma</Text>
            </View>

            <Text style={styles.labelGroup}>SELECIONE SEU PERFIL:</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, role === 'produtor' && styles.toggleBtnActive]}
                onPress={() => setRole('produtor')}
              >
                <Text style={[styles.toggleBtnText, role === 'produtor' && styles.toggleBtnTextActive]}>
                  🚜 Sou Produtor Rural{'\n'}(Procuro Silo)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, role === 'dono' && styles.toggleBtnActive]}
                onPress={() => setRole('dono')}
              >
                <Text style={[styles.toggleBtnText, role === 'dono' && styles.toggleBtnTextActive]}>
                  🏢 Sou Dono de Silo{'\n'}(Tenho Espaço)
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>CPF OU CNPJ</Text>
            <TextInput style={styles.input} placeholder="000.000.000-00" keyboardType="numeric" />

            <Text style={styles.inputLabel}>SENHA</Text>
            <TextInput style={styles.input} placeholder="••••••••" secureTextEntry />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setActiveTab('inicio');
                navigateTo('screen-dashboard');
              }}
            >
              <Text style={styles.primaryButtonText}>
                Entrar como {role === 'dono' ? 'Dono de Silo' : 'Produtor Rural'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* 2. TELA DASHBOARD (VISÃO DINÂMICA) */}
        {currentScreen === 'screen-dashboard' && (
          <ScrollView>
            <Text style={styles.screenTitleLeft}>
              {role === 'dono' ? 'Painel do Proprietário' : 'Silos Disponíveis na Região'}
            </Text>

            {/* SEÇÃO DE FILTROS (MUITO ÚTIL PARA PRODUTOR) */}
            <Text style={styles.labelGroup}>🔍 FILTRAR SILOS</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Filtrar por Cidade/UF..."
                value={filterCidade}
                onChangeText={setFilterCidade}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Grão (Ex: Soja)..."
                value={filterGrao}
                onChangeText={setFilterGrao}
              />
            </View>

            {/* MAPA INTERATIVO (REACT-NATIVE-MAPS) */}
            <Text style={[styles.labelGroup, { marginTop: 15 }]}>🗺️ MAPA DE SILOS DISPONÍVEIS</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: -17.7922,
                  longitude: -50.9192,
                  latitudeDelta: 1.5,
                  longitudeDelta: 1.5,
                }}
              >
                {silosFiltrados.map((silo) => (
                  <Marker
                    key={silo.id}
                    coordinate={{ latitude: silo.latitude, longitude: silo.longitude }}
                    title={silo.nome}
                    description={`${silo.localizacao} - ${silo.capacidade} Ton.`}
                    onPress={() => setSelectedSilo(silo)}
                  />
                ))}
              </MapView>
            </View>

            {/* AÇÃO PRINCIPAL DO DONO */}
            {role === 'dono' && (
              <TouchableOpacity
                style={[styles.primaryButton, { marginVertical: 12 }]}
                onPress={() => navigateTo('screen-criar-anuncio')}
              >
                <Text style={styles.primaryButtonText}>+ Cadastrar e Anunciar Novo Silo</Text>
              </TouchableOpacity>
            )}

            {/* LISTA DE SILOS ATUALIZADA EM TEMPO REAL */}
            <Text style={[styles.labelGroup, { marginTop: 10 }]}>
              📋 LISTA DE SILOS ({silosFiltrados.length} Encontrados)
            </Text>
            {silosFiltrados.map((silo) => (
              <View key={silo.id} style={styles.siloCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.siloCardTitle}>{silo.nome}</Text>
                  <Text style={styles.siloBadge}>{silo.capacidade} Toneladas</Text>
                </View>
                <Text style={styles.siloCardSub}>📍 {silo.localizacao} • Dono: {silo.dono}</Text>
                <Text style={styles.siloCardSub}>🌾 Grãos: {silo.graos} | 🚛 Acesso: {silo.acesso}</Text>
                
                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={() => {
                    setSelectedSilo(silo);
                    navigateTo('screen-resultado');
                  }}
                >
                  <Text style={styles.cardButtonText}>
                    {role === 'dono' ? 'Gerenciar / Acompanhar Leilão' : 'Fazer Proposta / Detalhes'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* 3. TELA CRIAR ANÚNCIO (DONO) */}
        {currentScreen === 'screen-criar-anuncio' && (
          <ScrollView>
            <TouchableOpacity style={styles.backButton} onPress={() => navigateTo('screen-dashboard')}>
              <Text style={styles.backButtonText}>← Voltar ao Dashboard</Text>
            </TouchableOpacity>

            <Text style={styles.screenTitleLeft}>Cadastrar Novo Silo</Text>

            <Text style={styles.inputLabel}>NOME DO SILO *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Silo Armazém Central"
              value={formSilo.nome}
              onChangeText={(t) => setFormSilo({ ...formSilo, nome: t })}
            />

            <Text style={styles.inputLabel}>LOCALIZAÇÃO (CIDADE/UF) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Rio Verde - GO"
              value={formSilo.localizacao}
              onChangeText={(t) => setFormSilo({ ...formSilo, localizacao: t })}
            />

            <Text style={styles.inputLabel}>CAPACIDADE DISPONÍVEL (TONELADAS) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5000"
              keyboardType="numeric"
              value={formSilo.capacidade}
              onChangeText={(t) => setFormSilo({ ...formSilo, capacidade: t })}
            />

            <Text style={styles.inputLabel}>TIPOS DE GRÃOS ACEITÁVEIS</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Soja, Milho, Feijão"
              value={formSilo.graos}
              onChangeText={(t) => setFormSilo({ ...formSilo, graos: t })}
            />

            <Text style={styles.inputLabel}>ACESSO PARA CAMINHÕES</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Bitrem, Rodotrem"
              value={formSilo.acesso}
              onChangeText={(t) => setFormSilo({ ...formSilo, acesso: t })}
            />

            <TouchableOpacity style={[styles.primaryButton, { marginTop: 20 }]} onPress={handleCriarSilo}>
              <Text style={styles.primaryButtonText}>Publicar e Disponibilizar Silo</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* 4. TELA ANÚNCIO CRIADO */}
        {currentScreen === 'screen-anuncio-criado' && (
          <ScrollView>
            <View style={styles.successCard}>
              <Text style={{ fontSize: 28 }}>✅</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginVertical: 4 }}>Silo Cadastrado com Sucesso!</Text>
              <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                Seu silo já está disponível no mapa e na lista pública de produtores rurais.
              </Text>
            </View>

            {selectedSilo && (
              <View style={styles.summaryCard}>
                <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>RESUMO DO SILO CRIADO:</Text>
                <Text style={styles.summaryItem}>📌 <Text style={{fontWeight:'bold'}}>Nome:</Text> {selectedSilo.nome}</Text>
                <Text style={styles.summaryItem}>📍 <Text style={{fontWeight:'bold'}}>Localização:</Text> {selectedSilo.localizacao}</Text>
                <Text style={styles.summaryItem}>⚖️ <Text style={{fontWeight:'bold'}}>Capacidade:</Text> {selectedSilo.capacidade} Toneladas</Text>
                <Text style={styles.summaryItem}>🌾 <Text style={{fontWeight:'bold'}}>Grãos:</Text> {selectedSilo.graos}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={() => navigateTo('screen-dashboard')}>
              <Text style={styles.primaryButtonText}>Ir para o Mapa e Ver Silo Cadastrado</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* 5. TELA DETALHES / RESULTADO DO SILO */}
        {currentScreen === 'screen-resultado' && selectedSilo && (
          <ScrollView>
            <TouchableOpacity style={styles.backButton} onPress={() => navigateTo('screen-dashboard')}>
              <Text style={styles.backButtonText}>← Voltar para Lista de Silos</Text>
            </TouchableOpacity>

            <Text style={styles.screenTitleLeft}>{selectedSilo.nome}</Text>

            <View style={styles.summaryCard}>
              <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>Informações Gerais</Text>
              <Text style={styles.summaryItem}>📍 Cidade/UF: {selectedSilo.localizacao}</Text>
              <Text style={styles.summaryItem}>👤 Proprietário: {selectedSilo.dono}</Text>
              <Text style={styles.summaryItem}>⚖️ Capacidade: {selectedSilo.capacidade} Toneladas</Text>
              <Text style={styles.summaryItem}>🌾 Grãos Suportados: {selectedSilo.graos}</Text>
              <Text style={styles.summaryItem}>🚛 Acesso Logístico: {selectedSilo.acesso}</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>
                {role === 'dono' ? 'Simulação de Receita Estimada' : 'Simulação de Custo de Aluguel'}
              </Text>
              <Text style={styles.summaryItem}>Estima-se R$ 45,00 por Tonelada/Mês</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#059669', marginTop: 6 }}>
                Total Est: R$ {(parseInt(selectedSilo.capacidade || 0) * 45).toLocaleString('pt-BR')},00 / mês
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => Alert.alert('Negociação', 'Abrindo canal de mensagens com o responsável...')}
            >
              <Text style={styles.primaryButtonText}>
                {role === 'dono' ? 'Gerenciar Propostas Recebidas' : 'Enviar Proposta ao Proprietário'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* 6. TELA DE PERFIL */}
        {currentScreen === 'screen-perfil' && (
          <ScrollView>
            <Text style={styles.screenTitleLeft}>Meu Perfil</Text>
            <View style={styles.profileHeader}>
              <Text style={{ fontSize: 24 }}>👤</Text>
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
                  {role === 'dono' ? 'José Silva (Dono de Silo)' : 'João Pedro (Produtor Rural)'}
                </Text>
                <Text style={{ fontSize: 11, color: '#6b7280' }}>Conta Verificada • ID #9482</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryItem}>🏢 Perfil Ativo: {role === 'dono' ? 'Proprietário' : 'Produtor'}</Text>
              <Text style={styles.summaryItem}>📦 Total de Silos no Sistema: {silos.length}</Text>
              <Text style={styles.summaryItem}>📄 Contratos Ativos: 2</Text>
            </View>

            <TouchableOpacity
              style={[styles.secondaryButton, { marginTop: 15 }]}
              onPress={() => navigateTo('screen-login')}
            >
              <Text style={styles.secondaryButtonText}>Sair ou Alternar Perfil</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* TABS DE NAVEGAÇÃO INFERIOR (VISÍVEIS QUANDO LOGADO) */}
      {currentScreen !== 'screen-login' && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'inicio' && styles.tabItemActive]}
            onPress={() => {
              setActiveTab('inicio');
              navigateTo('screen-dashboard');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'inicio' && styles.tabTextActive]}>🏠 Início / Mapa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'perfil' && styles.tabItemActive]}
            onPress={() => {
              setActiveTab('perfil');
              navigateTo('screen-perfil');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'perfil' && styles.tabTextActive]}>👤 Perfil</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  topHeader: {
    height: 50,
    backgroundColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerLogo: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  switchRoleBtn: { backgroundColor: '#4b5563', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  switchRoleText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  content: { flex: 1, padding: 15 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  screenTitleLeft: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#111827' },
  labelGroup: { fontSize: 11, fontWeight: 'bold', color: '#374151', marginBottom: 6 },

  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  toggleBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: '#374151' },
  toggleBtnText: { fontSize: 11, textAlign: 'center', color: '#374151' },
  toggleBtnTextActive: { color: '#ffffff', fontWeight: 'bold' },

  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#374151', marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },

  primaryButton: { backgroundColor: '#374151', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  primaryButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  secondaryButton: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#374151', fontWeight: 'bold', fontSize: 12 },

  row: { flexDirection: 'row', gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  mapContainer: { height: 180, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#d1d5db', marginBottom: 10 },
  map: { width: '100%', height: '100%' },

  siloCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  siloCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  siloBadge: { fontSize: 10, fontWeight: 'bold', backgroundColor: '#e5e7eb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  siloCardSub: { fontSize: 11, color: '#6b7280', marginTop: 3 },
  cardButton: { backgroundColor: '#374151', borderRadius: 6, paddingVertical: 6, alignItems: 'center', marginTop: 8 },
  cardButtonText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },

  backButton: { marginBottom: 10 },
  backButtonText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },

  successCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#10b981', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 15 },
  summaryCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 },
  summaryItem: { fontSize: 12, color: '#374151', marginVertical: 3 },

  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12 },

  tabBar: { flexDirection: 'row', height: 50, borderTopWidth: 1, borderTopColor: '#d1d5db', backgroundColor: '#ffffff' },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabItemActive: { backgroundColor: '#374151' },
  tabText: { fontSize: 12, fontWeight: 'bold', color: '#6b7280' },
  tabTextActive: { color: '#ffffff' },
});