import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Platform,
    StatusBar,
    Linking,
    Dimensions,
    Animated,
    Easing
} from 'react-native';
import {
    Send,
    FileText,
    Zap,
    ExternalLink,
    Github,
    Linkedin,
    Mail,
    ChevronRight,
    Smartphone,
    Monitor,
    Sparkles
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- 資料區塊 ---
const PORTFOLIO_DATA = {
    name: "Hung Ling",
    title: "AI 演算法與前端工程師",
    bio: "採用電影級 35mm 膠卷質感與高階光影控制技術，為您的專業應用程序與 POS 系統打造無與倫比的視覺素材。",
    lineLink: "https://line.me/R/ti/p/%40747uykhu",
    companyLink: "https://tt982a84-gif.github.io/HungLing/",
    assets: [
        {
            id: 1,
            title: "App 專業介面預覽",
            type: "Smartphone",
            description: "35mm Anamorphic • 1:1 Aspect. High-end smartphone interface with masterfully controlled lighting.",
            image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "POS 專業系統影像",
            type: "POS",
            description: "Modern terminal on a marble counter. Dramatic natural light shaping the scene.",
            image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=800&auto=format&fit=crop"
        }
    ],
    keywords: ["POS SYSTEM", "HTML APPLICATION", "POS SYSTEM", "HTML APPLICATION", "POS SYSTEM", "HTML APPLICATION"]
};

// --- 無限跑馬燈元件 ---
const InfiniteMarquee = ({ items, speed = 30000 }) => {
    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(scrollX, {
                toValue: -1,
                duration: speed,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = scrollX.interpolate({
        inputRange: [-1, 0],
        outputRange: [-(SCREEN_WIDTH * 2), 0],
    });

    return (
        <View style={styles.marqueeContainer}>
            <Animated.View style={[styles.marqueeContent, { transform: [{ translateX }] }]}>
                <View style={styles.marqueeInner}>
                    {items.map((item, idx) => (
                        <Text key={`m1-${idx}`} style={styles.marqueeText}>{item}</Text>
                    ))}
                </View>
                <View style={styles.marqueeInner}>
                    {items.map((item, idx) => (
                        <Text key={`m2-${idx}`} style={styles.marqueeText}>{item}</Text>
                    ))}
                </View>
            </Animated.View>
        </View>
    );
};

export default function App() {
    const sonarAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(sonarAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(sonarAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const openLink = (url) => {
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />

            <View style={styles.container}>
                {/* 背景裝飾 */}
                <View style={styles.backgroundLayer} pointerEvents="none">
                    <View style={styles.flashlightOverlay} />
                </View>

                {/* 特別色頂部 Marquee */}
                <InfiniteMarquee items={PORTFOLIO_DATA.keywords} speed={25000} />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header 區域 */}
                    <View style={styles.navigation}>
                        <Text style={styles.navLogo}>HUNGLING</Text>
                        <TouchableOpacity
                            style={styles.lineButton}
                            onPress={() => openLink(PORTFOLIO_DATA.lineLink)}
                        >
                            <Text style={styles.lineButtonText}>LINE</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Hero Section - Interaction Pro Style */}
                    <View style={styles.heroSection}>
                        <View style={styles.badgeRow}>
                            <Zap size={12} color="#F59E0B" />
                            <Text style={styles.badgeText}>INTERACTION PRO V2.5</Text>
                        </View>

                        <View style={styles.titleContainer}>
                            <Text style={styles.heroMainTitle}>設計專屬於您的</Text>
                            <Text style={[styles.heroMainTitle, styles.goldGradientText]}>APPLICATION</Text>
                            <Text style={styles.heroMainTitle}>WEBSITE</Text>
                        </View>

                        <Text style={styles.heroBioText}>
                            {PORTFOLIO_DATA.bio}
                        </Text>
                    </View>

                    {/* Feature Cards - Glass Style */}
                    <View style={styles.featuresSection}>
                        {PORTFOLIO_DATA.assets.map((asset, index) => (
                            <View key={asset.id} style={styles.glassCard}>
                                <View style={styles.cardImageWrapper}>
                                    <Image source={{ uri: asset.image }} style={styles.cardImage} />
                                    <View style={styles.imageOverlay} />
                                    {/* 模擬掃描線 */}
                                    <View style={styles.scanLine} />
                                </View>

                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeaderRow}>
                                        <View style={styles.cardIconBox}>
                                            {asset.type === 'Smartphone' ? <Smartphone size={24} color="#F59E0B" /> : <Monitor size={24} color="#F59E0B" />}
                                        </View>
                                        <View style={styles.cardTitleBox}>
                                            <Text style={styles.cardTitle}>{asset.title}</Text>
                                            <Text style={styles.cardSubTitle}>{asset.description.split('.')[0]}</Text>
                                        </View>
                                        <Sparkles size={20} color="#333" />
                                    </View>

                                    <View style={styles.quoteBox}>
                                        <Text style={styles.quoteText}>"{asset.description}"</Text>
                                    </View>

                                    <TouchableOpacity style={styles.sonarButton} onPress={() => openLink(PORTFOLIO_DATA.companyLink)}>
                                        {/* Sonar Effect Animation */}
                                        <Animated.View style={[styles.sonarPulse, {
                                            transform: [{ scale: sonarAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }) }],
                                            opacity: sonarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] })
                                        }]} />
                                        <View style={styles.sonarButtonInner}>
                                            <Text style={styles.sonarButtonText}>進入公司官網</Text>
                                            <ChevronRight size={16} color="#000" />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Footer - Professional Grade Marquee */}
                    <View style={styles.footerMarqueeArea}>
                        <InfiniteMarquee items={["POS SYSTEM", "HTML APPLICATION", "POS SYSTEM", "HTML APPLICATION"]} speed={15000} />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerBrand}>HUNGLING</Text>
                        <View style={styles.socialRow}>
                            <TouchableOpacity onPress={() => openLink('https://github.com/tt982a84-gif')}><Github size={20} color="#666" /></TouchableOpacity>
                            <TouchableOpacity><Linkedin size={20} color="#666" /></TouchableOpacity>
                            <TouchableOpacity onPress={() => openLink(PORTFOLIO_DATA.lineLink)}><Send size={20} color="#666" /></TouchableOpacity>
                        </View>
                        <View style={styles.footerCredits}>
                            <Text style={styles.creditsText}>© 2026 HUNGLING RESERVE.</Text>
                            <Text style={styles.creditsText}>DESIGNED BY AI</Text>
                        </View>
                    </View>

                </ScrollView>

                {/* 右下角懸浮 LINE 按鈕 */}
                <TouchableOpacity
                    style={styles.floatingLineButton}
                    onPress={() => openLink(PORTFOLIO_DATA.lineLink)}
                >
                    <View style={styles.lineCircle}>
                        <Text style={styles.lineLabel}>LINE</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#050505',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
    },
    backgroundLayer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#050505',
        zIndex: 0,
    },
    flashlightOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(245, 158, 11, 0.02)', // 手電筒底色模擬
    },
    marqueeContainer: {
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
    marqueeContent: {
        flexDirection: 'row',
    },
    marqueeInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
        paddingHorizontal: 16,
    },
    marqueeText: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(245, 158, 11, 0.6)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingBottom: 60,
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.03)',
    },
    navLogo: {
        fontSize: 20,
        fontWeight: '900',
        color: '#F5F5F5',
        letterSpacing: 4,
    },
    lineButton: {
        backgroundColor: '#C5A059',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    lineButtonText: {
        color: '#050505',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    heroSection: {
        paddingHorizontal: 24,
        paddingVertical: 64,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
        marginBottom: 24,
    },
    badgeText: {
        color: '#F59E0B',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
    },
    titleContainer: {
        marginBottom: 24,
    },
    heroMainTitle: {
        fontSize: 52,
        fontWeight: '900',
        color: '#F5F5F5',
        letterSpacing: -2,
        lineHeight: 52,
    },
    goldGradientText: {
        color: '#F59E0B', // 模擬 Gradient
    },
    heroBioText: {
        color: '#A0A0A0',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: '300',
        maxWidth: 320,
    },
    featuresSection: {
        paddingHorizontal: 20,
        gap: 40,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 10,
    },
    cardImageWrapper: {
        aspectRatio: 0.8,
        position: 'relative',
        backgroundColor: '#000',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    scanLine: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(245, 158, 11, 0.3)',
        shadowBlur: 10,
        shadowColor: '#F59E0B',
    },
    cardContent: {
        padding: 30,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    cardIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitleBox: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#F5F5F5',
        letterSpacing: -0.5,
    },
    cardSubTitle: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
        letterSpacing: 1,
    },
    quoteBox: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.03)',
        marginBottom: 32,
    },
    quoteText: {
        color: '#888',
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    sonarButton: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sonarPulse: {
        position: 'absolute',
        width: '100%',
        height: 54,
        borderRadius: 30,
        backgroundColor: 'rgba(245, 158, 11, 0.3)',
    },
    sonarButtonInner: {
        width: '100%',
        height: 54,
        backgroundColor: '#FFF',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        zIndex: 1,
    },
    sonarButtonText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    footerMarqueeArea: {
        marginTop: 80,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.03)',
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 40,
        alignItems: 'center',
    },
    footerBrand: {
        fontSize: 40,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.03)',
        letterSpacing: 10,
        marginBottom: 20,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 32,
        marginBottom: 40,
    },
    footerCredits: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.03)',
    },
    creditsText: {
        fontSize: 9,
        color: '#333',
        fontWeight: '600',
        letterSpacing: 2,
    },
    floatingLineButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        zIndex: 999,
        shadowColor: '#00B900',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    lineCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#00B900',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    lineLabel: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
