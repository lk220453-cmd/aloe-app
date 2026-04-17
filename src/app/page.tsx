"use client";

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type MaterialType = 'VIDEO' | 'DOCUMENT' | 'NOTICE' | 'FREE';
type UserRole = 'ADMIN' | 'BUSINESS';

interface AppUser {
  username: string;
  name: string;
  role: UserRole;
}

interface Material {
  id: string;
  title: string;
  type: MaterialType;
  thumbnailUrl: string;
  category: string;
  year?: string;
  month?: string;
  fileName?: string;
  fileUrl?: string;
  productName?: string;
  content?: string;
  youtubeUrl?: string;
  isPinned?: boolean;
}

const getYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

interface PromoFolder {
  id: string;
  year: string;
  month: string;
  title: string;
}

const initialMockMaterials: Material[] = [
  { id: '1', title: '큐어 알로에 수딩젤 활용법 및 피부 기초 교육', type: 'VIDEO', thumbnailUrl: 'https://picsum.photos/seed/1/400/225', category: '화장품' },
  { id: '2', title: '신제품 홍삼 알로에 젤리 상세 안내서', type: 'DOCUMENT', thumbnailUrl: 'https://picsum.photos/seed/2/400/225', category: '건식' },
  { id: '3', title: '이달의 우수 카운셀러 영업 노하우 인터뷰', type: 'VIDEO', thumbnailUrl: 'https://picsum.photos/seed/3/400/225', category: '회사소식/홍보' },
  { id: '4', title: '현장 판매 꿀팁 및 대화 스크립트 모음', type: 'DOCUMENT', thumbnailUrl: 'https://picsum.photos/seed/4/400/225', category: '회사소식/홍보' },
  { id: '7', title: '4월 사업자 정기 교육 일정 공지', type: 'NOTICE', thumbnailUrl: 'https://picsum.photos/seed/7/400/225', category: '게시판' },
  { id: '8', title: '면역력 증진 세일즈 가이드 영상', type: 'VIDEO', thumbnailUrl: 'https://picsum.photos/seed/8/400/225', category: '건식' },
  { id: '9', title: '알로에 마스크팩 성분 분석 결과서', type: 'DOCUMENT', thumbnailUrl: 'https://picsum.photos/seed/9/400/225', category: '화장품' },
  { id: '10', title: '강남지사 워크샵 사진 공유합니다~', type: 'FREE', thumbnailUrl: 'https://picsum.photos/seed/10/400/225', category: '게시판' },
  // 월간프로모션 전용 데이터
  { id: 'p1', title: '4월 알로에베라 전반기 특별 할인 표', type: 'DOCUMENT', thumbnailUrl: '', category: '브랜드판촉', year: '2026', month: '4' },
  { id: 'p2', title: '4월 봄맞이 사은품 증정 안내문', type: 'DOCUMENT', thumbnailUrl: '', category: '브랜드판촉', year: '2026', month: '4' },
  { id: 'p4', title: '12월 겨울 보습 특별 기획 (종료)', type: 'DOCUMENT', thumbnailUrl: '', category: '브랜드판촉', year: '2025', month: '12' },
];


const initialPromoFolders: PromoFolder[] = [
  { id: 'f1', year: '2026', month: '4', title: '4월 행사 기획전' },
  { id: 'f3', year: '2025', month: '12', title: '12월 겨울 마감세일' },
];

const categories = ['ALL', '건식', '화장품', '기기', '회사소식/홍보', '영업자료집', '브랜드판촉', '게시판'];

const heroConfigs: Record<string, { bgUrl: string, bgUrl2?: string, title: string, desc: string, colorClass: string, accentClass: string, subTitle: string, bgClass?: string, bgClass2?: string, circleUrl?: string, circlePos?: string }> = {
  'ALL': {
    bgUrl: '/bg.jpg',
    title: '전문 교육 자료실',
    subTitle: '자연의 생명력 그대로,',
    desc: '사업자 및 카운셀러님의 성공적인 영업을 돕기 위해 본사에서 제공하는 프리미엄 교육 자료 및 프로모션 안내입니다.',
    colorClass: 'from-green-950/90 via-green-900/40',
    accentClass: 'from-green-300 to-green-500'
  },
  '건식': {
    bgUrl: '/supps1.png',
    bgUrl2: '/supps2.png',
    title: '건강기능식품 자료관',
    subTitle: '건강을 채우는 에너지,',
    desc: '안전하고 효능이 검증된 건강기능식품 시리즈의 전문 템플릿과 세일즈 가이드입니다.',
    colorClass: 'from-amber-950/95 via-orange-900/60',
    accentClass: 'from-orange-300 to-yellow-400',
    bgClass: 'object-contain object-right opacity-40 scale-[1.3] -translate-x-[20%] -translate-y-4 group-hover:-translate-x-[25%] transition-transform duration-[15s]',
    bgClass2: 'object-contain object-right opacity-60 scale-[1.25] translate-x-2 translate-y-6 md:translate-x-10 md:translate-y-10 group-hover:scale-[1.3] transition-transform duration-[10s] absolute inset-0 z-0'
  },
  '화장품': {
    bgUrl: '/cosmetics.jpg',
    title: '코스메틱 자료관',
    subTitle: '아름다움의 본질, 피부과학',
    desc: '김정문알로에만의 특허 기술이 담긴 기초 및 색조 화장품 시리즈의 교육 코스입니다.',
    colorClass: 'from-black/95 via-gray-900/60',
    accentClass: 'from-yellow-400 to-amber-200',
    bgClass: 'object-cover object-right md:object-center opacity-70 group-hover:scale-105 transition-transform duration-[20s]'
  },
  '기기': {
    bgUrl: '/device.png',
    title: '디바이스 튜토리얼',
    subTitle: '최첨단 과학 기술,',
    desc: '프리미엄 김정문알로에 건강기기의 활용 튜토리얼과 매뉴얼입니다.',
    colorClass: 'from-violet-950/90 via-purple-900/40',
    accentClass: 'from-violet-300 to-fuchsia-400'
  },
'회사소식/홍보': {
  bgUrl: '/bg.jpg',
    circleUrl: '/char_girl.png',
      circlePos: '50% center',
        title: '자료공유 아카이브',
          subTitle: '현장 노하우의 집약,',
            desc: '사업자 및 지사에서 직접 제작하고 공유하는 다채로운 영업 노하우와 맞춤 교안들입니다.',
              colorClass: 'from-slate-950/90 via-cyan-900/40',
                accentClass: 'from-cyan-300 to-blue-400'
},
'게시판': {
  bgUrl: '/bg.jpg',
    circleUrl: '/char_girl.png',
      circlePos: '0% center',
        title: '소통 커뮤니티',
          subTitle: '오픈 커뮤니케이션 라운지,',
            desc: '본사 긴급 공지사항과 대리점간의 자유로운 의견을 실시간으로 교환할 수 있는 플랫폼입니다.',
              colorClass: 'from-indigo-950/90 via-blue-900/40',
                accentClass: 'from-indigo-300 to-blue-400'
},
'영업자료집': {
  bgUrl: '/bg.jpg',
  circleUrl: '/char_girl.png',
  circlePos: '100% center',
  title: '영업자료집',
  subTitle: '현장 영업의 핵심 무기,',
  desc: '제품별 세일즈 포인트, 상담 스크립트, 영업 전략 자료 등 현장에서 바로 활용할 수 있는 영업 전문 자료 모음입니다.',
  colorClass: 'from-teal-950/90 via-teal-900/40',
  accentClass: 'from-teal-300 to-emerald-400'
},
'브랜드판촉': {
  bgUrl: '/bg.jpg',
    circleUrl: '/char_green.png',
      circlePos: '0% center',
        title: '브랜드 판촉',
          subTitle: '고객 경험의 극대화, 파워 세일즈',
            desc: '이달의 핵심 브랜드 판촉 행사와 사은품, 특가 기획전 관련 마케팅 자료입니다.',
              colorClass: 'from-rose-950/90 via-red-900/40',
                accentClass: 'from-red-300 to-pink-400'
}
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('BUSINESS');
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  const [healthProducts, setHealthProducts] = useState<string[]>(['전체', '기타']);
  const [cosmeticsProducts, setCosmeticsProducts] = useState<string[]>(['전체', '기타']);
  const [deviceProducts, setDeviceProducts] = useState<string[]>(['전체', '기타']);

  const [showProductMgmt, setShowProductMgmt] = useState(false);
  const [productMgmtCategory, setProductMgmtCategory] = useState<'건식'|'화장품'|'기기'>('건식');
  const [newProductName, setNewProductName] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('aloeSession');
    if (!session) {
      window.location.href = '/login';
      return;
    }
    const user: AppUser = JSON.parse(session);
    setCurrentUser(user);
    setUserRole(user.role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aloeSession');
    window.location.href = '/login';
  };

  const loadPendingUsers = async () => {
    const { data } = await supabase.from('users').select('*').order('id', { ascending: false });
    setPendingUsers(data || []);
    setShowUserMgmt(true);
  };

  const approveUser = async (userId: string) => {
    await supabase.from('users').update({ status: 'approved' }).eq('id', userId);
    loadPendingUsers();
  };

  const rejectUser = async (userId: string) => {
    await supabase.from('users').update({ status: 'rejected' }).eq('id', userId);
    loadPendingUsers();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await supabase.from('users').delete().eq('id', userId);
    loadPendingUsers();
  };

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
    if (data) {
      setHealthProducts(['전체', ...data.filter((p: any) => p.category === '건식').map((p: any) => p.name), '기타']);
      setCosmeticsProducts(['전체', ...data.filter((p: any) => p.category === '화장품').map((p: any) => p.name), '기타']);
      setDeviceProducts(['전체', ...data.filter((p: any) => p.category === '기기').map((p: any) => p.name), '기타']);
    }
  };

  const addProduct = async () => {
    if (!newProductName.trim()) return;
    await supabase.from('products').insert({ category: productMgmtCategory, name: newProductName.trim(), sort_order: 99 });
    setNewProductName('');
    loadProducts();
  };

  const deleteProduct = async (category: string, name: string) => {
    if (!confirm(`"${name}" 제품을 삭제하시겠습니까?`)) return;
    await supabase.from('products').delete().eq('category', category).eq('name', name);
    loadProducts();
  };

  const [materials, setMaterials] = useState<Material[]>(initialMockMaterials);
  const [promoFolders, setPromoFolders] = useState<PromoFolder[]>(initialPromoFolders);

  useEffect(() => {
    const loadData = async () => {
      const { data: matsData } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
      const { data: foldersData } = await supabase.from('promo_folders').select('*');

      if (matsData && matsData.length > 0) {
        const mapped = matsData.map((m: any) => ({
          id: m.id, title: m.title, type: m.type, thumbnailUrl: m.thumbnail_url || '',
          category: m.category, year: m.year, month: m.month,
          fileName: m.file_name, fileUrl: m.file_url, productName: m.product_name,
          content: m.content, youtubeUrl: m.youtube_url, isPinned: m.is_pinned || false,
        }));
        setMaterials(mapped);
      }
      if (foldersData && foldersData.length > 0) {
        setPromoFolders(foldersData);
      }
      await loadProducts();
    };
    loadData();
  }, []);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedSubBoard, setSelectedSubBoard] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState('전체');

  const [promoYear, setPromoYear] = useState('2026');
  const [promoMonth, setPromoMonth] = useState('4');
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 내용 수정 모달 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMat, setEditMat] = useState<Material | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editFileDeleted, setEditFileDeleted] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  // 상세보기 모달 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMat, setDetailMat] = useState<Material | null>(null);

  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // 글쓰기 모달 상태
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeType, setWriteType] = useState<'NOTICE' | 'FREE'>('FREE');
  const writeFileRef = useRef<HTMLInputElement>(null);
  const [writeFile, setWriteFile] = useState<File | null>(null);

  // 업로드 모달 상태 관리
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadTypeState, setUploadTypeState] = useState<MaterialType>('DOCUMENT');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProduct, setUploadProduct] = useState('스피그린');
  const [uploadMode, setUploadMode] = useState<'file' | 'youtube' | 'weblink'>('file');
  const [uploadYoutubeUrl, setUploadYoutubeUrl] = useState('');
  const [uploadWebUrl, setUploadWebUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============== 폴더 수정 로직 ==============
  const handleAddFolder = async () => {
    const yearInput = window.prompt('프로모션 자료를 등록할 연도를 입력하세요 (예: 2026)');
    if (!yearInput) return;
    const monthInput = window.prompt('자료를 등록할 월을 입력하세요 (예: 5)');
    if (!monthInput) return;
    const titleInput = window.prompt('좌측 폴더에 표시될 제목을 자유롭게 입력하세요 (예: 5월 가정의 달 기념)');
    if (!titleInput) return;

    const newFolder: PromoFolder = {
      id: 'f' + Date.now().toString(),
      year: yearInput.trim(),
      month: monthInput.trim(),
      title: titleInput
    };

    await supabase.from('promo_folders').insert(newFolder);
    setPromoFolders([...promoFolders, newFolder]);
    setPromoYear(newFolder.year);
    setPromoMonth(newFolder.month);
  };

  const handleEditFolderTitle = async (folderId: string, oldTitle: string) => {
    const titleInput = window.prompt('변경할 폴더 제목을 입력하세요:', oldTitle);
    if (!titleInput) return;

    await supabase.from('promo_folders').update({ title: titleInput }).eq('id', folderId);
    setPromoFolders(promoFolders.map(f => f.id === folderId ? { ...f, title: titleInput } : f));
  };

  const togglePin = async (mat: Material) => {
    const newVal = !mat.isPinned;
    await supabase.from('materials').update({ is_pinned: newVal }).eq('id', mat.id);
    setMaterials(prev => prev.map(m => m.id === mat.id ? { ...m, isPinned: newVal } : m));
  };

  // ============== 항목 수정 및 삭제 로직 ==============
  const handleEditMaterialTitle = async (mId: string, oldTitle: string) => {
    const titleInput = window.prompt('변경할 자료 제목을 입력하세요:', oldTitle);
    if (!titleInput) return;
    await supabase.from('materials').update({ title: titleInput }).eq('id', mId);
    setMaterials(materials.map(m => m.id === mId ? { ...m, title: titleInput } : m));
  };

  const handleDeleteMaterial = async (mId: string) => {
    if (window.confirm('정말로 이 자료를 완전히 삭제/숨김 처리하시겠습니까?')) {
      await supabase.from('materials').delete().eq('id', mId);
      setMaterials(materials.filter(m => m.id !== mId));
    }
  };

  const openUploadModal = () => {
    setUploadTitle('');
    setUploadFiles([]);
    setUploadTypeState('DOCUMENT');
    setUploadMode('file');
    setUploadYoutubeUrl('');
    setUploadWebUrl('');
    if ((selectedCategory === '건식' || selectedCategory === '화장품' || selectedCategory === '기기') && selectedProduct !== '전체') {
      setUploadProduct(selectedProduct);
    } else {
      setUploadProduct(selectedCategory === '화장품' ? '뉴)세레브퓨어알로에' : selectedCategory === '기기' ? '닥터셀이온' : '스피그린');
    }
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadFiles(files);
      if (files.length === 1) {
        if (!uploadTitle) setUploadTitle(files[0].name.replace(/\.[^/.]+$/, ""));
        if (files[0].type.startsWith('video/') || files[0].name.match(/\.(mp4|avi|mov)$/i)) {
          setUploadTypeState('VIDEO');
        } else {
          setUploadTypeState('DOCUMENT');
        }
      }
    }
  };

  const openEditModal = (mat: Material) => {
    setEditMat(mat);
    setEditTitle(mat.title);
    setEditContent(mat.content || '');
    setEditFile(null);
    setEditFileDeleted(false);
    setShowEditModal(true);
  };

  const uploadFileToStorage = async (file: File): Promise<{ fileName: string; fileUrl: string } | null> => {
    const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
    const safeName = `${Date.now()}${ext ? '.' + ext : ''}`;
    const filePath = `uploads/${safeName}`;
    const { error } = await supabase.storage.from('files').upload(filePath, file);
    if (error) {
      setUploadError(`저장 오류: ${error.message} (${error.statusCode ?? ''})`);
      return null;
    }
    const { data } = supabase.storage.from('files').getPublicUrl(filePath);
    return { fileName: file.name, fileUrl: data.publicUrl };
  };

  const executeEdit = async () => {
    if (!editMat || !editTitle.trim()) return;
    let fileUpdates: Partial<Material> = {};
    if (editFile) {
      const uploaded = await uploadFileToStorage(editFile);
      if (uploaded) fileUpdates = uploaded;
    } else if (editFileDeleted) {
      fileUpdates = { fileName: undefined, fileUrl: undefined };
    }
    await supabase.from('materials').update({
      title: editTitle.trim(),
      content: editContent,
      file_name: fileUpdates.fileName ?? (editFileDeleted ? null : editMat.fileName),
      file_url: fileUpdates.fileUrl ?? (editFileDeleted ? null : editMat.fileUrl),
    }).eq('id', editMat.id);
    setMaterials(prev => prev.map(m => m.id === editMat.id ? { ...m, title: editTitle.trim(), content: editContent, ...fileUpdates } : m));
    setShowEditModal(false);
    setEditMat(null);
    setEditFile(null);
    setEditFileDeleted(false);
  };

  const executeWrite = async () => {
    if (!writeTitle.trim()) return;
    const now = new Date();
    let fileName: string | undefined;
    let fileUrl: string | undefined;
    if (writeFile) {
      const uploaded = await uploadFileToStorage(writeFile);
      if (uploaded) { fileName = uploaded.fileName; fileUrl = uploaded.fileUrl; }
    }
    const newPost: Material = {
      id: 'm' + Date.now(),
      title: writeTitle.trim(),
      type: selectedCategory === '게시판' ? writeType : 'DOCUMENT',
      thumbnailUrl: '',
      category: selectedCategory,
      year: promoYear || String(now.getFullYear()),
      month: promoMonth || String(now.getMonth() + 1),
      content: writeContent,
      fileName, fileUrl,
    };
    await supabase.from('materials').insert({
      id: newPost.id, title: newPost.title, type: newPost.type, thumbnail_url: '',
      category: newPost.category, year: newPost.year, month: newPost.month,
      content: newPost.content, file_name: fileName, file_url: fileUrl,
    });
    setMaterials(prev => [newPost, ...prev]);
    setShowWriteModal(false);
    setWriteTitle('');
    setWriteContent('');
    setWriteFile(null);
    setWriteType('FREE');
  };

  const executeUpload = async () => {
    if (uploadMode === 'youtube') {
      if (!uploadTitle || !uploadYoutubeUrl.trim()) return;
    } else if (uploadMode === 'weblink') {
      if (!uploadTitle || !uploadWebUrl.trim()) return;
    } else {
      if (uploadFiles.length === 0) return;
      if (uploadFiles.length === 1 && !uploadTitle) return;
    }
    setUploadLoading(true);
    setUploadError('');

    let finalType: MaterialType = uploadTypeState;
    if (selectedCategory === '게시판') {
      finalType = selectedSubBoard === 'NOTICE' ? 'NOTICE' : selectedSubBoard === 'FREE' ? 'FREE' : 'DOCUMENT';
    } else if (selectedCategory === '브랜드판촉') {
      finalType = 'DOCUMENT';
    }

    if (uploadMode === 'weblink') {
      const url = uploadWebUrl.trim();
      const newMaterial: Material = {
        id: 'm' + Date.now().toString(), title: uploadTitle, type: uploadTypeState,
        thumbnailUrl: 'https://picsum.photos/seed/' + Math.floor(Math.random() * 100) + '/400/225',
        category: selectedCategory, year: promoYear, month: promoMonth, fileUrl: url, fileName: url,
      };
      await supabase.from('materials').insert({
        id: newMaterial.id, title: newMaterial.title, type: newMaterial.type,
        thumbnail_url: newMaterial.thumbnailUrl, category: newMaterial.category,
        year: newMaterial.year, month: newMaterial.month, file_url: url, file_name: url,
      });
      setMaterials([newMaterial, ...materials]);
      setUploadLoading(false);
      setShowUploadModal(false);
      return;
    } else if (uploadMode === 'youtube') {
      const youtubeId = getYouTubeId(uploadYoutubeUrl.trim());
      const newThumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : 'https://picsum.photos/seed/' + Math.floor(Math.random() * 100) + '/400/225';
      const newMaterial: Material = {
        id: 'm' + Date.now().toString(), title: uploadTitle, type: 'VIDEO',
        thumbnailUrl: newThumbnail, category: selectedCategory, year: promoYear, month: promoMonth,
        youtubeUrl: youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : undefined,
        productName: (selectedCategory === '건식' || selectedCategory === '화장품' || selectedCategory === '기기') ? uploadProduct : undefined
      };
      await supabase.from('materials').insert({
        id: newMaterial.id, title: newMaterial.title, type: newMaterial.type,
        thumbnail_url: newThumbnail, category: newMaterial.category,
        year: newMaterial.year, month: newMaterial.month,
        youtube_url: newMaterial.youtubeUrl, product_name: newMaterial.productName,
      });
      setMaterials([newMaterial, ...materials]);
    } else {
      const inserted: Material[] = [];
      for (const file of uploadFiles) {
        const title = uploadFiles.length === 1 ? uploadTitle : file.name.replace(/\.[^/.]+$/, "");
        const fileType: MaterialType = (file.type.startsWith('video/') || file.name.match(/\.(mp4|avi|mov)$/i)) ? 'VIDEO' : finalType;
        const uploaded = await uploadFileToStorage(file);
        if (!uploaded) { setUploadError('일부 파일 업로드에 실패했습니다.'); continue; }
        const newThumbnail = file.type.startsWith('image/') ? uploaded.fileUrl : 'https://picsum.photos/seed/' + Math.floor(Math.random() * 100) + '/400/225';
        const newMaterial: Material = {
          id: 'm' + Date.now().toString() + Math.random(), title, type: fileType,
          thumbnailUrl: newThumbnail, category: selectedCategory, year: promoYear, month: promoMonth,
          fileName: uploaded.fileName, fileUrl: uploaded.fileUrl,
          productName: (selectedCategory === '건식' || selectedCategory === '화장품' || selectedCategory === '기기') ? uploadProduct : undefined
        };
        await supabase.from('materials').insert({
          id: newMaterial.id, title: newMaterial.title, type: newMaterial.type,
          thumbnail_url: newThumbnail, category: newMaterial.category,
          year: newMaterial.year, month: newMaterial.month,
          file_name: newMaterial.fileName, file_url: newMaterial.fileUrl,
          product_name: newMaterial.productName,
        });
        inserted.push(newMaterial);
      }
      setMaterials([...inserted.reverse(), ...materials]);
    }
    setUploadLoading(false);
    setShowUploadModal(false);
  };
  // ==========================================

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedType('ALL');
    setSelectedSubBoard('ALL');
    setSelectedProduct('전체');
    setCurrentPage(1);
  };

  const filteredMaterials = materials.filter(mat => {
    const matchSearch = mat.title.toLowerCase().includes(search.toLowerCase());

    // 검색어 있으면 전체 카테고리에서 키워드만으로 검색
    if (search.trim() !== '') return matchSearch;

    const matchCategory = selectedCategory === 'ALL' || mat.category === selectedCategory;

    let matchType = true;
    if (selectedCategory === '건식' || selectedCategory === '화장품' || selectedCategory === '기기') {
      matchType = selectedType === 'ALL' || mat.type === selectedType;
      if ((selectedCategory === '건식' || selectedCategory === '화장품' || selectedCategory === '기기') && selectedProduct !== '전체') {
        if ((mat.productName || '기타') !== selectedProduct) matchType = false;
      }
    } else if (selectedCategory === '게시판') {
      matchType = selectedSubBoard === 'ALL' || mat.type === selectedSubBoard;
    } else if (selectedCategory === '브랜드판촉' && mat.category === '브랜드판촉') {
      matchType = mat.year === promoYear && mat.month === promoMonth;
    }

    if (selectedCategory === 'ALL' && mat.category === '브랜드판촉') {
      const latestFolder = [...promoFolders].sort((a, b) => {
        if (a.year !== b.year) return Number(b.year) - Number(a.year);
        return Number(b.month) - Number(a.month);
      })[0];
      if (latestFolder) {
        matchType = mat.year === latestFolder.year && mat.month === latestFolder.month;
      }
    }

    return matchSearch && matchCategory && matchType;
  });

  const promoMaterials = filteredMaterials;

  // 현재 연도 포함, 데이터 연도도 합산
  const thisYear = String(new Date().getFullYear());
  const allPromoYears = [...new Set([thisYear, ...promoFolders.map(f => f.year)])].sort((a, b) => Number(b) - Number(a));
  const sortedYears = allPromoYears;

  // 각 연도의 1~12월을 가상으로 생성 (폴더가 없어도 표시)
  const getMonthsForYear = (year: string): PromoFolder[] =>
    Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1);
      return promoFolders.find(f => f.year === year && f.month === m)
        || { id: `auto-${year}-${m}`, year, month: m, title: `${m}월 판촉 행사` };
    });

  const currentFolder = promoFolders.find(f => f.year === promoYear && f.month === promoMonth);
  const currentFolderTitle = currentFolder ? currentFolder.title : `${promoMonth}월 판촉 행사`;

  let uploadVisible = false;
  if (selectedCategory !== 'ALL') {
    if (userRole === 'ADMIN') {
      uploadVisible = true;
    } else if (userRole === 'BUSINESS') {
      if (selectedCategory === '회사소식/홍보' || selectedCategory === '영업자료집' || (selectedCategory === '게시판' && selectedSubBoard === 'FREE')) {
        uploadVisible = true;
      }
    } else if (userRole === 'COUNSELOR') {
      uploadVisible = false;
    }
  }


  if (!currentUser) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">

      {/* 상단 사용자 정보 바 */}
      <div className="flex justify-end items-center gap-3 mb-4">
        <span className="text-[13px] text-gray-500">
          {currentUser.role === 'ADMIN' ? '🔑 관리자' : '🏬 사업자'} <strong>{currentUser.name}</strong>님
        </span>
        {currentUser.role === 'ADMIN' && (
          <>
            <button
              onClick={loadPendingUsers}
              className="text-[12px] bg-[#7a9a52] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#5f7d3a] transition-colors"
            >
              👥 사용자 관리
            </button>
            <button
              onClick={() => { setShowProductMgmt(true); loadProducts(); }}
              className="text-[12px] bg-[#7a9a52] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#5f7d3a] transition-colors"
            >
              📋 제품 관리
            </button>
          </>
        )}
        <button
          onClick={handleLogout}
          className="text-[12px] bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          로그아웃
        </button>
      </div>

      {/* 제품 관리 모달 */}
      {showProductMgmt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" style={{maxHeight: 'calc(100vh - 64px)'}}>
            <div className="flex-shrink-0 flex justify-between items-center p-5 border-b bg-gray-50">
              <h3 className="font-extrabold text-[17px]">📋 제품 관리</h3>
              <button onClick={() => setShowProductMgmt(false)} className="text-gray-400 hover:text-gray-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            {/* 카테고리 탭 */}
            <div className="flex-shrink-0 flex border-b">
              {(['건식', '화장품', '기기'] as const).map(cat => (
                <button key={cat} onClick={() => setProductMgmtCategory(cat)}
                  className={`flex-1 py-3 text-[14px] font-bold transition-colors ${productMgmtCategory === cat ? 'text-[#00723a] border-b-2 border-[#00b050]' : 'text-gray-400 hover:text-gray-600'}`}>
                  {cat}
                </button>
              ))}
            </div>
            {/* 제품 목록 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(productMgmtCategory === '건식' ? healthProducts : productMgmtCategory === '화장품' ? cosmeticsProducts : deviceProducts)
                .filter(p => p !== '전체' && p !== '기타')
                .map(name => (
                  <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-[14px] font-medium text-gray-700">{name}</span>
                    <button onClick={() => deleteProduct(productMgmtCategory, name)}
                      className="text-[12px] bg-red-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-600">삭제</button>
                  </div>
                ))}
            </div>
            {/* 새 제품 추가 */}
            <div className="flex-shrink-0 p-4 border-t bg-gray-50 flex gap-2">
              <input
                type="text"
                value={newProductName}
                onChange={e => setNewProductName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addProduct()}
                placeholder="새 제품명 입력"
                className="flex-1 p-2.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#7a9a52]/50"
              />
              <button onClick={addProduct}
                className="px-4 py-2.5 bg-[#00b050] text-white rounded-xl font-bold text-[14px] hover:bg-[#009030]">추가</button>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 관리 모달 */}
      {showUserMgmt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h3 className="font-extrabold text-[17px]">👥 사용자 관리</h3>
              <button onClick={() => setShowUserMgmt(false)} className="text-gray-400 hover:text-gray-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {pendingUsers.length === 0 ? (
                <p className="text-center text-gray-400 py-8">등록된 사용자가 없습니다.</p>
              ) : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b text-gray-500 text-left">
                      <th className="pb-2 font-bold">이름</th>
                      <th className="pb-2 font-bold">아이디</th>
                      <th className="pb-2 font-bold">상태</th>
                      <th className="pb-2 font-bold">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map(u => (
                      <tr key={u.id} className="border-b py-2">
                        <td className="py-2">{u.name}</td>
                        <td className="py-2">{u.username}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${u.status === 'approved' ? 'bg-green-100 text-green-700' : u.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                            {u.status === 'approved' ? '승인' : u.status === 'rejected' ? '거절' : '대기'}
                          </span>
                        </td>
                        <td className="py-2 flex gap-1">
                          {u.status !== 'approved' && (
                            <button onClick={() => approveUser(u.id)} className="text-[11px] bg-green-500 text-white px-2 py-1 rounded font-bold">승인</button>
                          )}
                          {u.status !== 'rejected' && (
                            <button onClick={() => rejectUser(u.id)} className="text-[11px] bg-orange-400 text-white px-2 py-1 rounded font-bold">거절</button>
                          )}
                          <button onClick={() => deleteUser(u.id)} className="text-[11px] bg-red-500 text-white px-2 py-1 rounded font-bold">삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🔴 내 컴퓨터 파일 업로드 모달창 */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pb-8 px-4 bg-gray-900/50 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 flex flex-col" style={{maxHeight: 'calc(100vh - 64px)'}}>
            {/* 모달 헤더 */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-extrabold text-[17px] text-gray-800 flex items-center">
                <span className="text-xl mr-2">📤</span>
                {selectedCategory === '브랜드판촉'
                  ? `${promoYear}년 ${promoMonth}월 브랜드 판촉 올리기`
                  : `[${selectedCategory}] 새 자료 등록`}
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-800 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors"
                title="닫기"
              >
                ✕
              </button>
            </div>

            {/* 모달 메인 폼 */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">

              {/* 자료 제목 */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">자료 제목</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full p-3.5 text-[15px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b050]/50 focus:border-[#00b050] transition-all bg-gray-50/30"
                  placeholder="앱에 노출될 자료의 제목을 입력하세요."
                />
              </div>

              {/* 업로드 방식 탭 */}
              <div>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4">
                  <button
                    onClick={() => setUploadMode('file')}
                    className={`flex-1 py-2.5 text-[13px] font-bold transition-colors ${uploadMode === 'file' ? 'bg-[#00b050] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    📁 파일 업로드
                  </button>
                  <button
                    onClick={() => setUploadMode('youtube')}
                    className={`flex-1 py-2.5 text-[13px] font-bold transition-colors ${uploadMode === 'youtube' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    ▶ YouTube
                  </button>
                  {(selectedCategory === '회사소식/홍보' || selectedCategory === '영업자료집') && (
                    <button
                      onClick={() => setUploadMode('weblink')}
                      className={`flex-1 py-2.5 text-[13px] font-bold transition-colors ${uploadMode === 'weblink' ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                      🔗 웹 링크
                    </button>
                  )}
                </div>

                {uploadMode === 'weblink' ? (
                  <div>
                    <input
                      type="url"
                      value={uploadWebUrl}
                      onChange={e => setUploadWebUrl(e.target.value)}
                      placeholder="https://example.com/영상링크 또는 웹페이지 주소"
                      className="w-full p-3.5 text-[14px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all"
                    />
                    {uploadWebUrl && (
                      <p className="mt-2 text-[12px] text-blue-500 font-bold">🔗 {uploadWebUrl}</p>
                    )}
                  </div>
                ) : uploadMode === 'youtube' ? (
                  <div>
                    <input
                      type="text"
                      value={uploadYoutubeUrl}
                      onChange={e => setUploadYoutubeUrl(e.target.value)}
                      placeholder="https://youtu.be/xxxxx 또는 youtube.com/watch?v=xxxxx"
                      className="w-full p-3.5 text-[14px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all"
                    />
                    {uploadYoutubeUrl && getYouTubeId(uploadYoutubeUrl) && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-red-200">
                        <img
                          src={`https://img.youtube.com/vi/${getYouTubeId(uploadYoutubeUrl)}/maxresdefault.jpg`}
                          alt="YouTube 미리보기"
                          className="w-full h-36 object-cover"
                        />
                        <p className="text-[11px] text-center text-red-500 font-bold py-1.5 bg-red-50">YouTube 썸네일 미리보기</p>
                      </div>
                    )}
                    {uploadYoutubeUrl && !getYouTubeId(uploadYoutubeUrl) && (
                      <p className="mt-2 text-[12px] text-red-500 font-bold">올바른 YouTube 주소가 아닙니다.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2 flex items-center justify-between">
                      <span>내 컴퓨터 파일 찾기</span>
                      <span className="text-[11px] font-normal text-gray-400">영상, 텍스트, 문서, 기타 자료 모두 가능</span>
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploadFiles.length > 0 ? 'border-green-300 bg-green-50/30' : 'border-gray-300 hover:bg-green-50 hover:border-green-300 bg-gray-50'}`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <span className={`text-4xl mb-3 transition-transform ${uploadFiles.length > 0 ? 'scale-110 opacity-100' : 'opacity-40 grayscale'}`}>
                            {uploadFiles.length > 1 ? '📦' : uploadFiles.length === 1 ? (uploadFiles[0].type.includes('video') ? '🎬' : uploadFiles[0].type.includes('image') ? '🖼️' : '📄') : '📁'}
                          </span>
                          <p className="mb-2 text-sm text-gray-500 font-medium">
                            <span className="font-extrabold text-[#00b050]">클릭해서 내 컴퓨터 파일 찾기 (다중 선택 가능)</span>
                          </p>
                          <p className="text-[11px] text-gray-400">지원 확장자: PDF, MP4, JPEG, PPTX, TXT 등 (최대 100MB)</p>
                        </div>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {uploadFiles.length > 0 && (
                      <div className="mt-3 flex flex-col gap-2">
                        {uploadFiles.map((f, i) => (
                          <div key={i} className="p-3 bg-white border border-green-200 rounded-xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center text-[13px] font-bold text-gray-800 truncate pr-4">
                              <span className="text-green-500 mr-2 text-lg">✓</span>
                              <span className="truncate">{f.name}</span>
                              <span className="text-gray-400 ml-2 font-normal text-[11px]">({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <button
                              className="text-gray-400 hover:text-red-500 text-xs font-bold px-2 py-1 bg-gray-50 hover:bg-red-50 rounded transition-colors whitespace-nowrap"
                              onClick={() => setUploadFiles(uploadFiles.filter((_, idx) => idx !== i))}
                            >삭제</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 건식/화장품/기기 전용 제품군 선택 */}
              {(selectedCategory === '건식' || selectedCategory === '화장품' || selectedCategory === '기기') && (
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">{selectedCategory} 세부 제품군 선택</label>
                  <select
                    value={uploadProduct}
                    onChange={(e) => setUploadProduct(e.target.value)}
                    className="w-full p-3.5 text-[14px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b050]/50 transition-all bg-white"
                  >
                    {(selectedCategory === '건식' ? healthProducts : selectedCategory === '화장품' ? cosmeticsProducts : deviceProducts).filter(p => p !== '전체').map(prod => (
                      <option key={prod} value={prod}>{prod}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 종류 속성 선택 (건식, 화장품, 기기, 회사소식/홍보 등의 카테고리일 경우에만) */}
              {(selectedCategory === '건식' || selectedCategory === '화장품' || selectedCategory === '기기' || selectedCategory === '회사소식/홍보' || selectedCategory === '영업자료집') && (
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">자료 종류 속성 명시</label>
                  <div className="flex space-x-3">
                    {(['DOCUMENT', 'VIDEO'] as const).map(type => (
                      <label key={type} className={`flex items-center space-x-2 cursor-pointer px-4 py-2.5 flex-1 justify-center rounded-xl border transition-colors ${uploadTypeState === type ? 'bg-green-50 border-[#00b050] shadow-sm' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}>
                        <input
                          type="radio"
                          name="uploadTypeState"
                          checked={uploadTypeState === type}
                          onChange={() => setUploadTypeState(type)}
                          className="w-4 h-4 text-[#00b050] border-gray-300 focus:ring-[#00b050]"
                        />
                        <span className={`text-[13px] font-bold ${uploadTypeState === type ? 'text-[#00b050]' : 'text-gray-600'}`}>
                          {type === 'DOCUMENT' ? '📄 문서 자료 (TXT, PDF)' : '▶ 영상 자료 (MP4 등)'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 모달 하단 액션 버튼 */}
            {uploadError && <p className="flex-shrink-0 px-5 pb-2 text-red-500 text-[13px] font-bold">{uploadError}</p>}
            <div className="flex-shrink-0 p-5 border-t border-gray-100 bg-gray-50/80 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm"
              >
                닫기
              </button>
              <button
                onClick={executeUpload}
                disabled={uploadLoading || (uploadMode === 'youtube' ? (!uploadTitle || !getYouTubeId(uploadYoutubeUrl)) : uploadMode === 'weblink' ? (!uploadTitle || !uploadWebUrl.trim()) : (uploadFiles.length === 0 || (uploadFiles.length === 1 && !uploadTitle)))}
                className="px-8 py-2.5 rounded-xl font-extrabold bg-[#00b050] text-white shadow-md shadow-green-500/20 hover:bg-[#009030] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-95"
              >
                {uploadLoading ? '업로드 중...' : uploadMode === 'youtube' ? 'YouTube 링크 등록' : uploadMode === 'weblink' ? '웹 링크 등록' : '파일 업로드 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🔴 끝: 내 컴퓨터 파일 업로드 모달창 */}

      {/* 📝 내용 수정 모달 */}
      {showEditModal && editMat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-extrabold text-[17px] text-gray-800">📝 자료 수정</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-1 block">제목 *</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00b050]/40 focus:border-[#00b050]" />
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-1 block">내용</label>
                <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={5}
                  placeholder="내용을 입력하세요..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00b050]/40 focus:border-[#00b050] resize-none" />
              </div>
              {/* 첨부파일 관리 */}
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-2 block">첨부파일</label>
                {editMat?.fileName && !editFileDeleted && !editFile ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-lg">📎</span>
                    <span className="flex-1 text-[13px] text-gray-700 font-medium truncate">{editMat.fileName}</span>
                    <button onClick={() => setEditFileDeleted(true)}
                      className="text-[11px] font-bold text-red-500 hover:bg-red-50 border border-red-200 px-2 py-1 rounded-lg transition-colors">삭제</button>
                    <label className="text-[11px] font-bold text-[#00b050] hover:bg-green-50 border border-green-200 px-2 py-1 rounded-lg cursor-pointer transition-colors">
                      교체
                      <input type="file" className="hidden" ref={editFileRef} onChange={e => { const f = e.target.files?.[0]; if (f) setEditFile(f); }} />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    {editFile ? (
                      <>
                        <span className="text-lg">📎</span>
                        <span className="flex-1 text-[13px] text-[#00b050] font-medium truncate">{editFile.name}</span>
                        <button onClick={() => { setEditFile(null); setEditFileDeleted(!!editMat?.fileName); }}
                          className="text-[11px] text-gray-400 hover:text-red-500 px-2 py-1 rounded">취소</button>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400 text-[13px]">{editFileDeleted ? '파일이 삭제됩니다.' : '첨부파일 없음'}</span>
                        <label className="ml-auto text-[11px] font-bold text-[#00b050] hover:bg-green-50 border border-green-200 px-2 py-1 rounded-lg cursor-pointer transition-colors">
                          파일 선택
                          <input type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setEditFile(f); setEditFileDeleted(false); } }} />
                        </label>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">취소</button>
              <button onClick={executeEdit} disabled={!editTitle.trim()}
                className="flex-1 py-3 rounded-xl bg-[#00b050] text-white font-bold hover:bg-[#009030] disabled:opacity-40 transition-colors shadow-md">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 📋 브랜드판촉 상세보기 모달 */}
      {showDetailModal && detailMat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <h3 className="font-extrabold text-[17px] text-gray-800">📋 자료 상세보기</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* 제목 */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">제목</p>
                <p className="text-[17px] font-extrabold text-gray-800">{detailMat.title}</p>
              </div>
              {/* 등록 정보 */}
              <div className="flex gap-4 text-[12px] text-gray-400 font-medium">
                <span>📅 {detailMat.year}.{(detailMat.month || '').padStart(2, '0')}.01</span>
                <span>📂 {detailMat.type === 'VIDEO' ? '영상' : '문서'}</span>
              </div>
              {/* 내용 */}
              {detailMat.content ? (
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">내용</p>
                  <div className="bg-gray-50 rounded-xl p-4 text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                    {detailMat.content}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 text-[13px] text-gray-400 text-center border border-dashed border-gray-200">
                  등록된 내용이 없습니다.
                </div>
              )}
              {/* YouTube 영상 */}
              {detailMat.youtubeUrl && (
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">YouTube 영상</p>
                  <div className="rounded-xl overflow-hidden border border-gray-200" style={{ aspectRatio: '16/9' }}>
                    <iframe
                      src={detailMat.youtubeUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
              {/* 첨부파일 */}
              {detailMat.fileUrl && detailMat.fileName && (
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">첨부파일</p>
                  <a href={detailMat.fileUrl} download={detailMat.fileName}
                    className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors group">
                    <span className="text-2xl">📎</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#1a3010] truncate">{detailMat.fileName}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">클릭하여 다운로드</p>
                    </div>
                    <span className="text-[#00b050] font-bold text-[13px] group-hover:underline">⬇ 다운로드</span>
                  </a>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 flex-shrink-0">
              <button onClick={() => setShowDetailModal(false)}
                className="w-full py-3 rounded-xl bg-[#00b050] text-white font-bold hover:bg-[#009030] transition-colors">닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ 글쓰기 모달 (게시판 / 브랜드판촉) */}
      {showWriteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-extrabold text-[17px] text-gray-800">
                {selectedCategory === '게시판' ? '📝 게시글 작성' : `📝 ${promoYear}년 ${promoMonth}월 자료 작성`}
              </h3>
              <button onClick={() => setShowWriteModal(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* 게시판 타입 선택 */}
              {selectedCategory === '게시판' && (
                <div className="flex gap-2">
                  {(['FREE', 'NOTICE'] as const).map(t => (
                    <button key={t}
                      onClick={() => setWriteType(t)}
                      className={`px-4 py-2 rounded-lg text-[13px] font-bold border transition-colors ${writeType === t ? 'bg-[#00b050] text-white border-[#00b050]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#00b050]'}`}
                    >
                      {t === 'FREE' ? '💬 자유게시판' : '📢 공지사항'}
                    </button>
                  ))}
                </div>
              )}

              {/* 제목 */}
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-1 block">제목 *</label>
                <input
                  type="text"
                  value={writeTitle}
                  onChange={e => setWriteTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00b050]/40 focus:border-[#00b050]"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-1 block">내용</label>
                <textarea
                  value={writeContent}
                  onChange={e => setWriteContent(e.target.value)}
                  placeholder="내용을 입력하세요..."
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00b050]/40 focus:border-[#00b050] resize-none"
                />
              </div>

              {/* 첨부파일 */}
              <div>
                <label className="text-[12px] font-bold text-gray-500 mb-1 block">첨부파일 (선택)</label>
                <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-[#00b050] hover:bg-green-50/30 transition-colors">
                  <span className="text-gray-400 text-lg">📎</span>
                  <span className="text-[13px] text-gray-500 truncate">{writeFile ? writeFile.name : '파일 선택...'}</span>
                  <input ref={writeFileRef} type="file" className="hidden" onChange={e => setWriteFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowWriteModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">취소</button>
              <button
                onClick={executeWrite}
                disabled={!writeTitle.trim()}
                className="flex-1 py-3 rounded-xl bg-[#00b050] text-white font-bold hover:bg-[#009030] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
              >등록</button>
            </div>
          </div>
        </div>
      )}


      {/* 🌿 스킨케어 스타일 히어로 */}
      <div key={selectedCategory} className="relative overflow-hidden rounded-3xl mb-10 bg-[#9eb87a] animate-in fade-in duration-500">
        {/* 우측 어두운 패널 장식 */}
        <div className="absolute right-0 top-0 bottom-0 w-[18%] bg-[#6a8840]/40 rounded-r-3xl" />
        <div className="absolute left-0 top-0 bottom-0 w-[4%] bg-[#6a8840]/20 rounded-l-3xl" />

        <div className="relative z-10 flex items-center justify-between px-12 md:px-16 py-12 md:py-14 gap-6">

          {/* 좌: 텍스트 + 배지 */}
          <div className="flex-1 max-w-[480px]">
            <p className={`font-bold tracking-[0.2em] uppercase mb-5 transition-all duration-300 ${hoveredBadge ? 'text-[#1a3010] text-[14px]' : 'text-[#2d4a1a]/55 text-[10px] tracking-[0.3em]'}`}>
              {hoveredBadge ? '김정문알로에 경영이념' : 'Kim Jung Moon Aloe · Premium Platform'}
            </p>
            <div className="relative mb-5" style={{ minHeight: '120px' }}>
              {/* 기본 제목 */}
              <h1 className={`text-[#1a3010] text-[44px] md:text-[54px] font-black leading-[1.1] tracking-tight break-keep transition-opacity duration-300 ${hoveredBadge ? 'opacity-0' : 'opacity-100'}`}>
                {selectedCategory === 'ALL'
                  ? <>건강한 아름다움을<br />자연에서 찾다</>
                  : <>{heroConfigs[selectedCategory]?.subTitle || heroConfigs['ALL'].subTitle}<br />{heroConfigs[selectedCategory]?.title || ''}</>
                }
              </h1>
              {/* 경영이념 제목 오버레이 */}
              <h1 className={`absolute top-0 left-0 text-[#1a3010] text-[44px] md:text-[54px] font-black leading-[1.1] tracking-tight break-keep transition-opacity duration-300 ${hoveredBadge ? 'opacity-100' : 'opacity-0'}`}>
                {hoveredBadge || ''}
              </h1>
            </div>
            <p className="text-[#2d4a1a]/65 text-[14px] font-medium leading-relaxed mb-10 max-w-sm break-keep transition-all duration-300">
              {selectedCategory === 'ALL'
                ? '사업자 및 카운셀러님의 성공적인 영업을 돕는 프리미엄 교육 자료 플랫폼입니다.'
                : (heroConfigs[selectedCategory]?.desc || '').substring(0, 60) + '…'
              }
            </p>

            {/* 3개 아이콘 배지 */}
            <div className="flex items-center gap-7">
              {[
                { icon: '🍃', label: '자연주의', desc: '자연은 인간이 가장 인간다운 삶을 영위할 수 있는 최상의 조건이며, 인간은 자연에 대한 연구와 그 결과의 선용을 통해 자연성을 회복할 수 있다는 것이 김정문알로에의 신념이다.' },
                { icon: '🤝', label: '인간존중', desc: '인간은 기업활동의 무한한 원천이며 궁극적인 목적이다. 구성원들 자신의 개성과 창의성 및 잠재능력을 발휘할 수 있는 여건을 마련해주는 것이 기업경영의 제일과제다.' },
                { icon: '🌏', label: '사회기여', desc: '김정문알로에는 경영활동의 결과가 사회와 환경에 미치는 영향을 스스로 점검하고, 기업이윤을 최대한 사회에 환원할 수 있는 방법을 끊임없이 발굴하여 실천한다.' },
              ].map((badge, i) => (
                <div key={i}
                  onMouseEnter={() => setHoveredBadge(badge.label)}
                  onMouseLeave={() => setHoveredBadge(null)}
                  className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className={`w-[52px] h-[52px] rounded-full border-2 backdrop-blur-sm flex items-center justify-center text-[22px] transition-all duration-200 ${hoveredBadge === badge.label ? 'bg-[#1a3010] border-[#1a3010] scale-110 shadow-lg' : 'border-[#2d4a1a]/25 bg-white/25'}`}>
                    {badge.icon}
                  </div>
                  <span className={`text-[10px] font-bold tracking-wide transition-colors ${hoveredBadge === badge.label ? 'text-[#1a3010]' : 'text-[#2d4a1a]/55'}`}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 중앙: 식물 장식 */}
          <div className="hidden lg:block text-[110px] opacity-[0.12] select-none -rotate-12 flex-shrink-0">
            🌿
          </div>

          {/* 우: 원형 이미지 + 경영이념 오버레이 (절대위치로 흔들림 없음) */}
          <div className="flex-shrink-0 relative w-[220px] h-[220px] md:w-[260px] md:h-[260px]">
            {/* 기본: 원형 이미지 */}
            {(() => {
              const cfg = heroConfigs[selectedCategory];
              const hasChar = !!cfg?.circleUrl;
              const isDevice = selectedCategory === '기기';
              const src = cfg?.circleUrl || cfg?.bgUrl || '/cosmetics.jpg';
              return (
                <div className={`w-full h-full rounded-full overflow-hidden border-[5px] shadow-2xl transition-opacity duration-300 ${hoveredBadge ? 'opacity-0' : 'opacity-100'} ${hasChar || isDevice ? 'bg-white border-white/80' : 'border-white/50'}`}>
                  <img
                    src={src}
                    alt="대표 이미지"
                    className={`w-full h-full ${isDevice ? 'object-contain p-4' : 'object-cover'}`}
                    style={cfg?.circlePos ? { objectPosition: cfg.circlePos } : {}}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/bg.jpg'; }}
                  />
                </div>
              );
            })()}
            {/* 오버레이: 경영이념 사각 패널 */}
            <div className={`absolute inset-0 rounded-2xl overflow-hidden bg-white shadow-2xl flex items-center justify-center transition-opacity duration-300 ${hoveredBadge ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <img src="/icon.png" alt="logo bg" className="absolute inset-0 w-full h-full object-contain p-6 opacity-[0.18] pointer-events-none" />
              <div className="relative z-10 w-full h-full flex items-center justify-center p-5">
                {[
                  { label: '자연주의', desc: '자연은 인간이 가장\n인간다운 삶을 영위할 수 있는\n최상의 조건이며, 인간은 자연에\n대한 연구와 그 결과의 선용을\n통해 자연성을 회복할 수 있다는\n것이 김정문알로에의 신념이다.' },
                  { label: '인간존중', desc: '인간은 기업활동의\n무한한 원천이며 궁극적인 목적이다.\n구성원들 자신의 개성과 창의성\n및 잠재능력을 발휘할 수 있는\n여건을 마련해주는 것이\n기업경영의 제일과제다.' },
                  { label: '사회기여', desc: '김정문알로에는 경영활동의\n결과가 사회와 환경에 미치는\n영향을 스스로 점검하고,\n기업이윤을 최대한 사회에\n환원할 수 있는 방법을\n끊임없이 발굴하여 실천한다.' },
                ].map(b => (
                  <p key={b.label} className={`text-[#1a3010] text-[15px] font-bold leading-[1.75] text-center transition-opacity duration-200 absolute inset-0 flex items-center justify-center px-4 py-2 whitespace-pre-line ${hoveredBadge === b.label ? 'opacity-100' : 'opacity-0'}`}>
                    {b.desc}
                  </p>
                ))}
              </div>
            </div>
            {/* 회전형 배지 */}
            <div
              className="absolute -bottom-1 -right-1 w-[58px] h-[58px] rounded-full bg-[#1a3010] shadow-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#243d16] transition-colors"
              onClick={() => {
                document.getElementById('category-nav')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <span className="text-white text-[11px] leading-none">▶</span>
              <span className="text-white/70 text-[8px] font-bold mt-0.5">자료열람</span>
            </div>
          </div>

        </div>
      </div>

      {/* 검색 및 업로드 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 gap-4">
        <div className="relative w-full md:w-[500px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="찾으시는 자료의 키워드를 직접 검색해 보세요..."
            className="w-full pl-11 pr-4 py-3.5 text-[15px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b050]/50 focus:border-[#00b050] transition-all bg-gray-50/30"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full md:w-auto mt-2 md:mt-0 flex gap-2">
          {uploadVisible ? (
            <>
              {/* 게시판 전용 글쓰기 버튼 */}
              {selectedCategory === '게시판' && (
                <button
                  onClick={() => { setWriteTitle(''); setWriteContent(''); setWriteFile(null); setWriteType('FREE'); setShowWriteModal(true); }}
                  className="bg-white border-2 border-[#00b050] text-[#00b050] px-5 py-3.5 rounded-xl font-bold hover:bg-green-50 active:scale-95 transition-all whitespace-nowrap flex items-center gap-2"
                >
                  <span>✏️</span><span>글쓰기</span>
                </button>
              )}
              <button
                onClick={() => {
                  if (selectedCategory === 'ALL') {
                    alert('전체 보기 탭에서는 업로드할 수 없습니다. 특정 카테고리를 선택해 주세요.');
                    return;
                  }
                  openUploadModal();
                }}
                className="w-full md:w-auto bg-[#00b050] text-white px-6 py-3.5 rounded-xl font-bold shadow-md shadow-green-500/20 hover:bg-[#009030] active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2"
              >
                <span className="text-lg leading-none">+</span>
                <span>
                  {selectedCategory === '브랜드판촉' ? `새 폴더에 프로모션 자료 올리기` : '자료 올리기'}
                </span>
              </button>
            </>
          ) : (
            selectedCategory !== 'ALL' && (
              <span className="text-sm text-gray-400 font-medium px-2 pt-2 flex items-center">
                🔒 현재 접속하신 계정으로는 문서를 단독 등록할 권한이 없습니다.
              </span>
            )
          )}
        </div>
      </div>

      {/* 메가 메뉴 네비게이션 */}
      <div
        id="category-nav"
        className="relative mb-6"
        onMouseLeave={() => setMegaMenuOpen(null)}
      >
        <nav className="bg-[#c8d4b0] border-b border-[#a8b890]">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-center overflow-x-auto scrollbar-hide">
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat;
              const isAll = cat === 'ALL';
              return (
                <div key={cat} className="relative flex items-center flex-shrink-0">
                  {idx > 0 && (
                    <span className="text-[#a8b890] text-[12px] select-none">|</span>
                  )}
                  <div onMouseEnter={() => cat !== 'ALL' ? setMegaMenuOpen(cat) : setMegaMenuOpen(null)}>
                    <button
                      onClick={() => { handleCategoryChange(cat); setMegaMenuOpen(null); }}
                      className={`relative px-5 py-[15px] text-[13px] whitespace-nowrap transition-colors duration-150 ${isAll
                          ? isActive
                            ? 'text-[#1a3010] font-bold'
                            : 'text-[#3a5a20] font-bold hover:text-[#1a3010]'
                          : isActive
                            ? 'text-[#1a3010] font-semibold'
                            : 'text-[#4a6a30] font-normal hover:text-[#1a3010]'
                        }`}
                    >
                      {isAll ? '전체보기(최신순)' : cat}
                      {isActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-[#3a5a20] rounded-full block" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* 메가 메뉴 패널 */}
        {megaMenuOpen && megaMenuOpen !== 'ALL' && (
          <div className="absolute left-0 right-0 top-full z-50 bg-white shadow-2xl border border-gray-100 border-t-0 rounded-b-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">

            {/* 건식 */}
            {megaMenuOpen === '건식' && (
              <div className="flex">
                <div className="flex-1 p-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">자료 형식</p>
                  <div className="flex gap-4 mb-5 pb-4 border-b border-gray-100">
                    {[{ id: 'ALL', label: '모두' }, { id: 'DOCUMENT', label: '📄 문서' }, { id: 'VIDEO', label: '▶ 영상' }].map(t => (
                      <button key={t.id} onClick={() => { handleCategoryChange('건식'); setSelectedType(t.id); setMegaMenuOpen(null); }}
                        className={`text-[13px] transition-colors relative pb-1 ${selectedCategory === '건식' && selectedType === t.id ? 'text-[#00b050] font-bold' : 'text-gray-500 hover:text-[#00723a]'}`}>
                        {t.label}
                        {selectedCategory === '건식' && selectedType === t.id && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#00b050] rounded-full block" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">건강기능식품 제품군</p>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
                    {healthProducts.map(prod => (
                      <button key={prod} onClick={() => { handleCategoryChange('건식'); setSelectedProduct(prod); setMegaMenuOpen(null); }}
                        className={`text-left py-2 px-3 rounded-lg text-[13px] transition-all flex items-center gap-1.5 ${selectedCategory === '건식' && selectedProduct === prod ? 'bg-[#00b050]/10 text-[#00b050] font-bold' : 'text-gray-600 hover:bg-[#00b050]/6 hover:text-[#00723a]'}`}>
                        {selectedCategory === '건식' && selectedProduct === prod && <span className="text-[11px]">➔</span>}
                        {prod}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-52 relative overflow-hidden flex-shrink-0">
                  <img src="/supps1.png" alt="건강기능식품" className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <p className="text-[10px] font-bold text-green-800/50 tracking-wider uppercase">Inner Beauty</p>
                    <p className="text-[15px] font-bold text-green-900/70 mt-0.5">건강기능식품</p>
                  </div>
                </div>
              </div>
            )}

            {/* 화장품 */}
            {megaMenuOpen === '화장품' && (
              <div className="flex">
                <div className="flex-1 p-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">자료 형식</p>
                  <div className="flex gap-4 mb-5 pb-4 border-b border-gray-100">
                    {[{ id: 'ALL', label: '모두' }, { id: 'DOCUMENT', label: '📄 문서' }, { id: 'VIDEO', label: '▶ 영상' }].map(t => (
                      <button key={t.id} onClick={() => { handleCategoryChange('화장품'); setSelectedType(t.id); setMegaMenuOpen(null); }}
                        className={`text-[13px] transition-colors relative pb-1 ${selectedCategory === '화장품' && selectedType === t.id ? 'text-[#00b050] font-bold' : 'text-gray-500 hover:text-[#00723a]'}`}>
                        {t.label}
                        {selectedCategory === '화장품' && selectedType === t.id && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#00b050] rounded-full block" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">코스메틱 제품군</p>
                  <div className="flex flex-col gap-0.5">
                    {cosmeticsProducts.map(prod => (
                      <button key={prod} onClick={() => { handleCategoryChange('화장품'); setSelectedProduct(prod); setMegaMenuOpen(null); }}
                        className={`text-left py-2 px-3 rounded-lg text-[13px] transition-all flex items-center gap-2 ${selectedCategory === '화장품' && selectedProduct === prod ? 'bg-[#00b050]/10 text-[#00b050] font-bold' : 'text-gray-600 hover:bg-[#00b050]/6 hover:text-[#00723a]'}`}>
                        {selectedCategory === '화장품' && selectedProduct === prod && <span className="text-[11px]">➔</span>}
                        {prod}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-52 relative overflow-hidden flex-shrink-0">
                  <img src="/cosmetics.jpg" alt="화장품" className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <p className="text-[10px] font-bold text-amber-900/50 tracking-wider uppercase">Cosmetics</p>
                    <p className="text-[15px] font-bold text-amber-900/70 mt-0.5">화장품</p>
                  </div>
                </div>
              </div>
            )}

            {/* 기기 */}
            {megaMenuOpen === '기기' && (
              <div className="flex">
                <div className="flex-1 p-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">자료 형식</p>
                  <div className="flex gap-4 mb-5 pb-4 border-b border-gray-100">
                    {[{ id: 'ALL', label: '모두' }, { id: 'DOCUMENT', label: '📄 문서' }, { id: 'VIDEO', label: '▶ 영상' }].map(t => (
                      <button key={t.id} onClick={() => { handleCategoryChange('기기'); setSelectedType(t.id); setMegaMenuOpen(null); }}
                        className={`text-[13px] transition-colors relative pb-1 ${selectedCategory === '기기' && selectedType === t.id ? 'text-[#00b050] font-bold' : 'text-gray-500 hover:text-[#00723a]'}`}>
                        {t.label}
                        {selectedCategory === '기기' && selectedType === t.id && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#00b050] rounded-full block" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">디바이스 제품군</p>
                  <div className="flex flex-col gap-0.5">
                    {deviceProducts.map(prod => (
                      <button key={prod} onClick={() => { handleCategoryChange('기기'); setSelectedProduct(prod); setMegaMenuOpen(null); }}
                        className={`text-left py-2 px-3 rounded-lg text-[13px] transition-all flex items-center gap-2 ${selectedCategory === '기기' && selectedProduct === prod ? 'bg-[#00b050]/10 text-[#00b050] font-bold' : 'text-gray-600 hover:bg-[#00b050]/6 hover:text-[#00723a]'}`}>
                        {selectedCategory === '기기' && selectedProduct === prod && <span className="text-[11px]">➔</span>}
                        {prod}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-52 relative overflow-hidden flex-shrink-0">
                  <img src="/device.png" alt="닥터셀이온" className="w-full h-full object-cover opacity-80"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/70 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <p className="text-[10px] font-bold text-violet-800/50 tracking-wider uppercase">Device</p>
                    <p className="text-[15px] font-bold text-violet-900/70 mt-0.5">뷰티 디바이스</p>
                  </div>
                </div>
              </div>
            )}

            {/* 회사소식/홍보 */}
            {megaMenuOpen === '회사소식/홍보' && (
              <div className="flex">
                <div className="flex-1 p-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">자료 형식</p>
                  <div className="flex flex-col gap-1">
                    {[{ id: 'ALL', label: '모두 보기' }, { id: 'DOCUMENT', label: '📄 문서' }, { id: 'VIDEO', label: '▶ 영상' }].map(t => (
                      <button key={t.id} onClick={() => { handleCategoryChange('회사소식/홍보'); setSelectedType(t.id); setMegaMenuOpen(null); }}
                        className={`text-left py-2 px-3 rounded-lg text-[13px] transition-all flex items-center gap-2 ${selectedCategory === '회사소식/홍보' && selectedType === t.id ? 'bg-[#00b050]/10 text-[#00b050] font-bold' : 'text-gray-600 hover:bg-[#00b050]/6 hover:text-[#00723a]'}`}>
                        {selectedCategory === '회사소식/홍보' && selectedType === t.id && <span className="text-[11px]">➔</span>}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-52 relative overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center">
                  <div className="text-7xl opacity-15">📂</div>
                  <div className="absolute bottom-6 left-6">
                    <p className="text-[10px] font-bold text-slate-500/50 tracking-wider uppercase">Archive</p>
                    <p className="text-[15px] font-bold text-slate-700/60 mt-0.5">회사소식/홍보</p>
                  </div>
                </div>
              </div>
            )}

            {/* 영업자료집 */}
            {megaMenuOpen === '영업자료집' && (
              <div className="flex">
                <div className="flex-1 p-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">자료 형식</p>
                  <div className="flex flex-col gap-1">
                    {[{ id: 'ALL', label: '모두 보기' }, { id: 'DOCUMENT', label: '📄 문서' }, { id: 'VIDEO', label: '▶ 영상' }].map(t => (
                      <button key={t.id} onClick={() => { handleCategoryChange('영업자료집'); setSelectedType(t.id); setMegaMenuOpen(null); }}
                        className={`text-left py-2 px-3 rounded-lg text-[13px] transition-all flex items-center gap-2 ${selectedCategory === '영업자료집' && selectedType === t.id ? 'bg-[#00b050]/10 text-[#00b050] font-bold' : 'text-gray-600 hover:bg-[#00b050]/6 hover:text-[#00723a]'}`}>
                        {selectedCategory === '영업자료집' && selectedType === t.id && <span className="text-[11px]">➔</span>}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-52 relative overflow-hidden flex-shrink-0 bg-teal-50 flex items-center justify-center">
                  <div className="text-7xl opacity-15">📋</div>
                  <div className="absolute bottom-6 left-6">
                    <p className="text-[10px] font-bold text-teal-500/50 tracking-wider uppercase">Sales</p>
                    <p className="text-[15px] font-bold text-teal-700/60 mt-0.5">영업자료집</p>
                  </div>
                </div>
              </div>
            )}

            {/* 게시판 */}
            {megaMenuOpen === '게시판' && (
              <div className="flex">
                <div className="flex-1 p-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">게시판 종류</p>
                  <div className="flex flex-col gap-1">
                    {[{ id: 'ALL', label: '전체 게시글' }, { id: 'NOTICE', label: '📢 공지사항' }, { id: 'FREE', label: '💬 자유게시판' }].map(t => (
                      <button key={t.id} onClick={() => { handleCategoryChange('게시판'); setSelectedSubBoard(t.id); setMegaMenuOpen(null); }}
                        className={`text-left py-2 px-3 rounded-lg text-[13px] transition-all flex items-center gap-2 ${selectedCategory === '게시판' && selectedSubBoard === t.id ? 'bg-[#00b050]/10 text-[#00b050] font-bold' : 'text-gray-600 hover:bg-[#00b050]/6 hover:text-[#00723a]'}`}>
                        {selectedCategory === '게시판' && selectedSubBoard === t.id && <span className="text-[11px]">➔</span>}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-52 relative overflow-hidden flex-shrink-0 bg-indigo-50/60 flex items-center justify-center">
                  <div className="text-7xl opacity-15">💬</div>
                  <div className="absolute bottom-6 left-6">
                    <p className="text-[10px] font-bold text-indigo-500/50 tracking-wider uppercase">Community</p>
                    <p className="text-[15px] font-bold text-indigo-700/60 mt-0.5">소통 게시판</p>
                  </div>
                </div>
              </div>
            )}

            {/* 브랜드판촉 — 당월 기준 앞뒤 월 표시 */}
            {megaMenuOpen === '브랜드판촉' && (() => {
              const now = new Date();
              const curYear = now.getFullYear();
              const curMonth = now.getMonth() + 1;
              // 현재 기준 -2 ~ +2 월 생성
              const nearMonths = [-2, -1, 0, 1, 2].map(offset => {
                let y = curYear, m = curMonth + offset;
                if (m < 1) { y -= 1; m += 12; }
                if (m > 12) { y += 1; m -= 12; }
                const folder = promoFolders.find(f => f.year === String(y) && f.month === String(m));
                return { year: String(y), month: String(m), title: folder?.title || null, isCurrent: offset === 0 };
              });
              return (
                <div className="flex">
                  <div className="flex-1 p-8">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">이달의 판촉 행사</p>
                    <div className="flex flex-col gap-2">
                      {nearMonths.map(({ year, month, isCurrent }) => (
                        <button key={`${year}-${month}`}
                          onClick={() => { handleCategoryChange('브랜드판촉'); setPromoYear(year); setPromoMonth(month); setMegaMenuOpen(null); }}
                          className={`text-left py-2 px-3 rounded-lg text-[13px] transition-all flex items-center gap-3 ${isCurrent ? 'bg-[#00b050]/10 text-[#00723a] font-extrabold' : 'text-gray-500 hover:text-[#00723a] hover:bg-gray-50'}`}>
                          <span className={`text-[11px] font-bold w-14 flex-shrink-0 ${isCurrent ? 'text-[#00b050]' : 'text-gray-400'}`}>
                            {year}년 {month}월
                          </span>
                          <span className="text-gray-300">|</span>
                          {isCurrent && <span className="text-[11px] text-[#00b050]">➔</span>}
                          <span className="text-[13px]">
                            {year}년 {month}월 판촉 자료
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-44 relative overflow-hidden flex-shrink-0 bg-green-50/60 flex items-center justify-center">
                    <div className="text-7xl opacity-10">🎁</div>
                    <div className="absolute bottom-6 left-6">
                      <p className="text-[10px] font-bold text-[#00b050]/50 tracking-wider uppercase">Promotion</p>
                      <p className="text-[14px] font-bold text-[#00723a]/60 mt-0.5">브랜드 판촉</p>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </div>


      {/* ============== 브랜드판촉 UI ============== */}
      {selectedCategory === '브랜드판촉' && search.trim() === '' ? (
        <div className="flex flex-col md:flex-row gap-6 mt-4">

          {/* 좌측 사이드바: 연도/월 관리 및 네비게이션 트리 */}
          <div className="w-full md:w-72 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm border-l-4 border-l-[#00b050] h-fit">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <h3 className="font-extrabold text-gray-800 flex items-center">
                🗓️ 프로모션 내비게이터
              </h3>
            </div>

            {sortedYears.map(year => (
              <div key={year} className="mb-4">
                <button
                  className={`w-full text-left font-extrabold text-[15px] p-3 rounded-lg flex justify-between items-center transition-colors ${promoYear === year ? 'text-[#00b050] bg-green-50' : 'text-gray-700 hover:bg-gray-50 border border-gray-100'}`}
                  onClick={() => setPromoYear(year)}
                >
                  {year}년 <span className="text-[10px]">▼</span>
                </button>
                {promoYear === year && (
                  <div className="pl-2 mt-2 space-y-1">
                    {getMonthsForYear(year).map(folder => {
                      const hasContent = materials.some(m => m.category === '브랜드판촉' && m.year === year && m.month === folder.month);
                      const isSelected = promoMonth === folder.month;
                      return (
                        <div key={folder.id} className="flex items-center group relative">
                          <button
                            onClick={() => setPromoMonth(folder.month)}
                            className={`flex-1 text-left text-[13px] px-3 py-2 rounded-l-lg transition-all truncate ${isSelected ? 'bg-[#00b050] text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-green-50 hover:text-[#00b050] font-medium'}`}
                          >
                            {folder.month}월
                            {hasContent && <span className={`ml-1.5 text-[9px] ${isSelected ? 'text-green-200' : 'text-[#00b050]'}`}>●</span>}
                          </button>
                          {/* 글쓰기 버튼 */}
                          {userRole === 'ADMIN' || userRole === 'BUSINESS' && (
                            <button
                              title="글쓰기"
                              onClick={() => { setPromoMonth(folder.month); setPromoYear(year); setWriteTitle(''); setWriteContent(''); setWriteFile(null); setShowWriteModal(true); }}
                              className={`px-2 py-2 text-[11px] border-y transition-colors ${isSelected ? 'bg-[#009030] border-[#009030] text-white' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-[#00b050]'}`}
                            >✏️</button>
                          )}
                          {/* 업로드 버튼 */}
                          {userRole === 'ADMIN' || userRole === 'BUSINESS' && (
                            <label
                              title="파일 업로드"
                              className={`px-2 py-2 text-[11px] rounded-r-lg border-y border-r cursor-pointer transition-colors ${isSelected ? 'bg-[#009030] border-[#009030] text-white' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-[#00b050]'}`}
                            >
                              📎
                              <input type="file" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setPromoMonth(folder.month);
                                setPromoYear(year);
                                const t = window.prompt('자료 제목:', file.name.replace(/\.[^/.]+$/, ''));
                                if (!t) return;
                                const newMat: Material = {
                                  id: 'm' + Date.now(),
                                  title: t.trim(),
                                  type: file.type.startsWith('video/') ? 'VIDEO' : 'DOCUMENT',
                                  thumbnailUrl: '',
                                  category: '브랜드판촉',
                                  year,
                                  month: folder.month,
                                  fileName: file.name,
                                  fileUrl: URL.createObjectURL(file),
                                };
                                setMaterials(prev => [newMat, ...prev]);
                                e.target.value = '';
                              }} />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

          </div>

          {/* 우측 리스트 뷰 */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm min-h-[400px]">
            <>
              <div className="flex flex-col mb-6 pb-5 border-b border-gray-100">
                <h3 className="font-extrabold text-[22px] text-gray-800 flex items-center mb-2">
                  <span className="text-2xl mr-2">📋</span> {promoYear}년 {promoMonth}월 판촉 자료
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  등록 자료 총 <span className="text-[#00b050] font-extrabold mx-1">{promoMaterials.length}</span>건
                </p>
              </div>

              <div className="space-y-3">
                {promoMaterials.map((mat, idx) => (
                  <div key={mat.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#00b050] hover:shadow-md transition-all cursor-pointer group bg-gray-50/30"
                    onClick={() => { setDetailMat(mat); setShowDetailModal(true); }}>
                    <div className="flex items-center space-x-4 w-full">
                      {/* 번호 */}
                      <div className="w-8 h-8 rounded-lg bg-[#00b050]/10 flex items-center justify-center text-[13px] font-extrabold text-[#00b050] flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                        {mat.type === 'VIDEO' ? '🎬' : mat.fileUrl ? '📎' : '📝'}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[15px] text-gray-800 group-hover:text-[#00b050] transition-colors truncate">{mat.title}</h4>
                          {mat.fileUrl && <span className="text-[10px] bg-green-50 text-[#00b050] border border-green-200 px-1.5 py-0.5 rounded font-bold flex-shrink-0">첨부</span>}
                          {userRole === 'ADMIN' && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 flex-shrink-0">
                              <button onClick={(e) => { e.stopPropagation(); openEditModal(mat); }} className="text-[11px] font-bold bg-white hover:bg-green-50 text-gray-500 hover:text-[#00b050] border border-gray-200 hover:border-green-200 px-2 py-0.5 rounded shadow-sm transition-colors">수정</button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteMaterial(mat.id); }} className="text-[11px] font-bold bg-white hover:bg-red-50 text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-2 py-0.5 rounded shadow-sm transition-colors">삭제</button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {mat.content ? mat.content.substring(0, 40) + (mat.content.length > 40 ? '…' : '') : '등록일: ' + mat.year + '.' + (mat.month || '').padStart(2, '0') + '.01'}
                        </p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setDetailMat(mat); setShowDetailModal(true); }}
                      className="text-[13px] font-bold bg-white text-gray-500 border border-gray-200 px-4 py-2 rounded-lg group-hover:bg-[#00b050] group-hover:text-white group-hover:border-[#00b050] active:scale-95 transition-all shadow-sm whitespace-nowrap">
                      열람
                    </button>
                  </div>
                ))}

                {promoMaterials.length === 0 && (
                  <div className="py-16 text-center flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32 mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
                      {/* NOTE: 요정 캐릭터 이미지 연동 */}
                      <img src="/fairy.png" alt="알로에 요정" className="w-full h-full object-contain drop-shadow-xl" onError={(e) => { e.currentTarget.outerHTML = '<span class="text-5xl opacity-30 grayscale filter">😥</span>'; }} />
                    </div>
                    <p className="text-[16px] font-extrabold text-gray-700">아직 이 섹션에 등록된 맞춤 프로모션 자료가 없네요!</p>
                    {userRole === 'ADMIN' && (
                      <p className="text-[13px] mt-2 text-[#00b050] font-medium bg-green-50 px-4 py-2 rounded-full">
                        상단의 <strong className="font-bold">+업로드 기능</strong>을 사용해 내 컴퓨터의 문서를 바로 업로드해 보세요!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
      ) : selectedCategory === '게시판' && search.trim() === '' ? (
        /* ============== 게시판 UI (공지 + 자유 분리) ============== */
        (() => {
          const noticePosts = materials
            .filter(m => m.category === '게시판' && m.type === 'NOTICE' && (search === '' || m.title.includes(search)))
            .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
          const freePosts = materials.filter(m => m.category === '게시판' && m.type === 'FREE' && (search === '' || m.title.includes(search)));

          const BoardSection = ({ title, icon, posts, boardType, accentColor, bgColor }: {
            title: string; icon: string; posts: typeof materials; boardType: 'NOTICE' | 'FREE'; accentColor: string; bgColor: string;
          }) => (
            <div className={`flex-1 bg-white rounded-2xl border shadow-sm overflow-hidden ${accentColor}`}>
              {/* 섹션 헤더 */}
              <div className={`px-5 py-4 flex items-center justify-between border-b ${bgColor}`}>
                <h3 className="font-extrabold text-[15px] flex items-center gap-2">
                  <span>{icon}</span>{title}
                  <span className="ml-1 text-[12px] font-bold text-gray-400">({posts.length})</span>
                </h3>
                {(userRole === 'ADMIN' || (userRole === 'BUSINESS' && boardType === 'FREE')) && (
                  <button
                    onClick={() => { setWriteType(boardType); setWriteTitle(''); setWriteContent(''); setWriteFile(null); setShowWriteModal(true); }}
                    className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#00b050] hover:text-[#00b050] transition-colors flex items-center gap-1"
                  >✏️ 글쓰기</button>
                )}
              </div>
              {/* 목록 헤더 */}
              <div className="flex items-center px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <span className="w-8 text-center">No.</span>
                <span className="flex-1 ml-3">제목</span>
                <span className="w-20 text-center hidden sm:block">등록일</span>
                <span className="w-14 text-center">열람</span>
              </div>
              {/* 목록 */}
              {posts.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {posts.map((mat, idx) => (
                    <div key={mat.id} className={`group flex items-center px-4 py-3 hover:bg-green-50/30 transition-colors cursor-pointer ${mat.isPinned ? 'bg-amber-50/60' : ''}`}
                      onClick={() => { setDetailMat(mat); setShowDetailModal(true); }}>
                      <span className="w-8 text-center text-[12px] font-bold flex-shrink-0">
                        {mat.isPinned ? <span className="text-amber-500">📌</span> : <span className="text-gray-300 group-hover:text-[#00b050]">{idx + 1}</span>}
                      </span>
                      <div className="flex-1 ml-3 min-w-0">
                        <p className={`text-[13px] font-semibold truncate flex items-center gap-1.5 ${mat.isPinned ? 'text-amber-700' : 'text-gray-700 group-hover:text-[#00723a]'}`}>
                          {mat.title}
                          {mat.youtubeUrl && <span className="text-[10px] bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded font-bold flex-shrink-0">YouTube</span>}
                          {mat.fileUrl && <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex-shrink-0">첨부</span>}
                        </p>
                        {mat.content && <p className="text-[11px] text-gray-400 truncate mt-0.5">{mat.content}</p>}
                      </div>
                      <span className="w-20 text-center text-[11px] text-gray-400 hidden sm:block flex-shrink-0">
                        {mat.year}.{(mat.month || '1').padStart(2, '0')}.01
                      </span>
                      <div className="w-32 flex justify-center gap-1 flex-shrink-0">
                        {userRole === 'ADMIN' && boardType === 'NOTICE' && (
                          <button onClick={(e) => { e.stopPropagation(); togglePin(mat); }}
                            className={`text-[11px] px-2 py-0.5 rounded-full border font-bold transition-all ${mat.isPinned ? 'bg-amber-100 border-amber-300 text-amber-600 hover:bg-amber-200' : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500'}`}>
                            {mat.isPinned ? '📌 고정됨' : '고정'}
                          </button>
                        )}
                        {userRole === 'ADMIN' && (
                          <button onClick={(e) => { e.stopPropagation(); setEditMat(mat); setEditTitle(mat.title); setEditContent(mat.content || ''); setEditFile(null); setEditFileDeleted(false); setShowEditModal(true); }}
                            className="text-[11px] text-gray-300 hover:text-blue-400 transition-colors px-1">수정</button>
                        )}
                        {userRole === 'ADMIN' && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteMaterial(mat.id); }}
                            className="text-[11px] text-gray-300 hover:text-red-400 transition-colors px-1">삭제</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center text-gray-400">
                  <p className="text-3xl mb-3 opacity-30">{icon}</p>
                  <p className="text-[13px] font-bold">등록된 {title}이 없습니다.</p>
                </div>
              )}
            </div>
          );

          return (
            <div className="mt-4 flex flex-col md:flex-row gap-5">
              {(selectedSubBoard === 'ALL' || selectedSubBoard === 'NOTICE') && (
                <BoardSection title="공지사항" icon="📢" posts={noticePosts} boardType="NOTICE"
                  accentColor="border-l-4 border-l-amber-400" bgColor="bg-amber-50/50" />
              )}
              {(selectedSubBoard === 'ALL' || selectedSubBoard === 'FREE') && (
                <BoardSection title="자유게시판" icon="💬" posts={freePosts} boardType="FREE"
                  accentColor="border-l-4 border-l-blue-300" bgColor="bg-blue-50/40" />
              )}
            </div>
          );
        })()
      ) : (
        /* ============== 번호 목록 UI ============== */
        (() => {
          const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / PAGE_SIZE));
          const safePage = Math.min(currentPage, totalPages);
          const pagedMaterials = filteredMaterials.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
          const globalOffset = (safePage - 1) * PAGE_SIZE;

          return (
            <div className="mt-4">
              {/* 목록 헤더 */}
              <div className="flex items-center px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 mb-1">
                <span className="w-10 text-center">No.</span>
                <span className="flex-1 ml-4">제목</span>
                <span className="w-24 text-center hidden sm:block">구분</span>
                <span className="w-16 text-center hidden sm:block">형식</span>
                <span className="w-16 text-center">열람</span>
              </div>

              {/* 목록 행 */}
              {pagedMaterials.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {pagedMaterials.map((mat, idx) => (
                    <div
                      key={mat.id}
                      onClick={() => {
                        if (mat.youtubeUrl || mat.content) {
                          setDetailMat(mat); setShowDetailModal(true);
                        } else if (mat.fileUrl) {
                          window.open(mat.fileUrl, '_blank');
                        } else {
                          alert(`[뷰어 오류] 이 자료는 예전에 등록된 껍데기(테스트) 자료라 실제 파일이 존재하지 않습니다. 방금 새로 업로드하신 파일을 클릭해 보세요!`);
                        }
                      }}
                      className="group flex items-center px-4 py-4 hover:bg-green-50/40 transition-colors cursor-pointer"
                    >
                      {/* 번호 */}
                      <span className="w-10 text-center text-[13px] font-bold text-gray-300 group-hover:text-[#00b050] transition-colors flex-shrink-0">
                        {globalOffset + idx + 1}
                      </span>

                      {/* 아이콘 + 제목 */}
                      <div className="flex-1 flex items-center gap-3 ml-4 min-w-0">
                        <span className="text-lg flex-shrink-0">{mat.youtubeUrl ? '▶' : mat.type === 'VIDEO' ? '🎬' : '📄'}</span>
                        <span className="text-[14px] font-medium text-gray-800 group-hover:text-[#00723a] transition-colors truncate">
                          {mat.fileName ? `[${mat.fileName}] ` : ''}{mat.title}
                        </span>
                        {mat.youtubeUrl && <span className="flex-shrink-0 text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">YouTube</span>}
                        {mat.category === '게시판' && mat.type === 'NOTICE' && (
                          <span className="flex-shrink-0 text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">공지</span>
                        )}
                      </div>

                      {/* 구분 */}
                      <span className={`w-24 text-center text-[11px] font-bold hidden sm:block flex-shrink-0 ${mat.category === '게시판' ? 'text-blue-500' : 'text-[#00b050]'}`}>
                        {mat.category === '게시판'
                          ? (mat.type === 'NOTICE' ? '📢 공지' : '💬 자유')
                          : ((mat.category === '건식' || mat.category === '화장품' || mat.category === '기기') && mat.productName ? mat.productName : mat.category)}
                      </span>

                      {/* 형식 */}
                      <span className="w-16 text-center text-[11px] text-gray-400 hidden sm:block flex-shrink-0">
                        {mat.type === 'VIDEO' ? '영상' : '문서'}
                      </span>

                      {/* 열람 버튼 + 수정/삭제 */}
                      <div className="w-16 flex items-center justify-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        {(userRole === 'ADMIN' || (userRole === 'BUSINESS' && (mat.category === '회사소식/홍보' || (mat.category === '게시판' && mat.type === 'FREE')))) && selectedCategory !== 'ALL' && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleEditMaterialTitle(mat.id, mat.title); }} className="text-[11px] text-gray-400 hover:text-[#00b050] transition-colors opacity-0 group-hover:opacity-100">수정</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteMaterial(mat.id); }} className="text-[11px] text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">삭제</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-200 mt-4">
                  <img src="/fairy.png" alt="알로에 요정" className="w-28 h-28 object-contain drop-shadow-xl mb-4 animate-bounce" style={{ animationDuration: '4s' }} onError={(e) => { e.currentTarget.outerHTML = '<span class="text-5xl text-gray-300 mb-4">🍃</span>'; }} />
                  <p className="text-[17px] font-extrabold text-gray-700">찾으시는 탭에 아직 등록된 자료가 없습니다.</p>
                  <p className="text-[13px] text-gray-500 mt-2 font-medium">관리자 또는 사업자 권한이라면 상단 로컬 업로드 버튼을 통해 즉시 추가해 보세요!</p>
                </div>
              )}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="px-3 py-1.5 text-[13px] text-gray-500 hover:text-[#00723a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ‹ 이전
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 text-[13px] rounded transition-colors ${p === safePage
                          ? 'text-[#00723a] font-bold border-b-2 border-[#00b050]'
                          : 'text-gray-400 hover:text-[#00723a]'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="px-3 py-1.5 text-[13px] text-gray-500 hover:text-[#00723a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    다음 ›
                  </button>
                </div>
              )}

              {/* 전체 건수 표시 */}
              {filteredMaterials.length > 0 && (
                <p className="text-center text-[12px] text-gray-400 mt-3">
                  전체 <span className="font-bold text-[#00b050]">{filteredMaterials.length}</span>건 중{' '}
                  {globalOffset + 1}–{Math.min(globalOffset + PAGE_SIZE, filteredMaterials.length)}번 표시 중
                </p>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}
