export interface BankBrand {
  code: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  logoUrl: string;
}

const bankBrands: Record<string, BankBrand> = {
  '001': {
    code: '001',
    name: 'Banco do Brasil S.A.',
    shortName: 'BB',
    primaryColor: '#FECE00',
    secondaryColor: '#003882',
    gradientFrom: '#003882',
    gradientTo: '#005BBB',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/bb.com.br',
  },
  '033': {
    code: '033',
    name: 'Banco Santander',
    shortName: 'Santander',
    primaryColor: '#EC0000',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#CC0000',
    gradientTo: '#EC0000',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/santander.com.br',
  },
  '104': {
    code: '104',
    name: 'Caixa Econômica Federal',
    shortName: 'Caixa',
    primaryColor: '#005CA9',
    secondaryColor: '#F37021',
    gradientFrom: '#005CA9',
    gradientTo: '#0077CC',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/caixa.gov.br',
  },
  '237': {
    code: '237',
    name: 'Banco Bradesco S.A.',
    shortName: 'Bradesco',
    primaryColor: '#CC092F',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#CC092F',
    gradientTo: '#E30B36',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/bradesco.com.br',
  },
  '341': {
    code: '341',
    name: 'Itaú Unibanco S.A.',
    shortName: 'Itaú',
    primaryColor: '#003399',
    secondaryColor: '#FF6600',
    gradientFrom: '#003399',
    gradientTo: '#0047CC',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/itau.com.br',
  },
  '077': {
    code: '077',
    name: 'Banco Inter S.A.',
    shortName: 'Inter',
    primaryColor: '#FF7A00',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#FF7A00',
    gradientTo: '#FF9933',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/bancointer.com.br',
  },
  '260': {
    code: '260',
    name: 'Nu Pagamentos S.A. (Nubank)',
    shortName: 'Nubank',
    primaryColor: '#820AD1',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#820AD1',
    gradientTo: '#A020F0',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/nubank.com.br',
  },
  '212': {
    code: '212',
    name: 'Banco Original S.A.',
    shortName: 'Original',
    primaryColor: '#00A651',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#00A651',
    gradientTo: '#00C464',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/original.com.br',
  },
  '336': {
    code: '336',
    name: 'Banco C6 S.A.',
    shortName: 'C6 Bank',
    primaryColor: '#242424',
    secondaryColor: '#CCCCCC',
    gradientFrom: '#1A1A1A',
    gradientTo: '#333333',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/c6bank.com.br',
  },
  '290': {
    code: '290',
    name: 'PagSeguro Internet S.A.',
    shortName: 'PagBank',
    primaryColor: '#00A94F',
    secondaryColor: '#FFC629',
    gradientFrom: '#00A94F',
    gradientTo: '#00C75A',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/pagseguro.uol.com.br',
  },
  '380': {
    code: '380',
    name: 'PicPay Serviços S.A.',
    shortName: 'PicPay',
    primaryColor: '#21C25E',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#21C25E',
    gradientTo: '#2EE06E',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/picpay.com',
  },
  '332': {
    code: '332',
    name: 'Banco BS2 S.A.',
    shortName: 'BS2',
    primaryColor: '#0066CC',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#0055AA',
    gradientTo: '#0077EE',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/bs2.com',
  },
  '655': {
    code: '655',
    name: 'Banco Votorantim S.A. (Neon)',
    shortName: 'Neon',
    primaryColor: '#00E5FF',
    secondaryColor: '#0066FF',
    gradientFrom: '#0066FF',
    gradientTo: '#00AAFF',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/neon.com.br',
  },
  '074': {
    code: '074',
    name: 'Banco J. Safra S.A.',
    shortName: 'Safra',
    primaryColor: '#003366',
    secondaryColor: '#C8A951',
    gradientFrom: '#003366',
    gradientTo: '#004C99',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/safra.com.br',
  },
  '422': {
    code: '422',
    name: 'Banco Safra S.A.',
    shortName: 'Safra',
    primaryColor: '#003366',
    secondaryColor: '#C8A951',
    gradientFrom: '#003366',
    gradientTo: '#004C99',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/safra.com.br',
  },
  '748': {
    code: '748',
    name: 'Banco Cooperativo Sicredi S.A.',
    shortName: 'Sicredi',
    primaryColor: '#00613C',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#00613C',
    gradientTo: '#008050',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/sicredi.com.br',
  },
  '756': {
    code: '756',
    name: 'Banco Cooperativo do Brasil S.A. (SICOOB)',
    shortName: 'Sicoob',
    primaryColor: '#003641',
    secondaryColor: '#78BE20',
    gradientFrom: '#003641',
    gradientTo: '#004D5C',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/sicoob.com.br',
  },
  '041': {
    code: '041',
    name: 'Banrisul',
    shortName: 'Banrisul',
    primaryColor: '#004B87',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#004B87',
    gradientTo: '#0066B3',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/banrisul.com.br',
  },
  '070': {
    code: '070',
    name: 'BRB - Banco de Brasília S.A.',
    shortName: 'BRB',
    primaryColor: '#003399',
    secondaryColor: '#FFCC00',
    gradientFrom: '#003399',
    gradientTo: '#004CBB',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/brb.com.br',
  },
  '623': {
    code: '623',
    name: 'Banco Pan S.A.',
    shortName: 'Banco Pan',
    primaryColor: '#0066FF',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#0055DD',
    gradientTo: '#0077FF',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/bancopan.com.br',
  },
  '208': {
    code: '208',
    name: 'Banco BTG Pactual S.A.',
    shortName: 'BTG Pactual',
    primaryColor: '#002855',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#001F44',
    gradientTo: '#003366',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/btgpactual.com',
  },
  '003': {
    code: '003',
    name: 'Banco da Amazônia S.A.',
    shortName: 'BASA',
    primaryColor: '#006633',
    secondaryColor: '#FFCC00',
    gradientFrom: '#006633',
    gradientTo: '#008844',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/bancoamazonia.com.br',
  },
  '004': {
    code: '004',
    name: 'Banco do Nordeste do Brasil S.A.',
    shortName: 'BNB',
    primaryColor: '#CC0033',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#AA0029',
    gradientTo: '#DD003D',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/bnb.gov.br',
  },
  '121': {
    code: '121',
    name: 'Banco Agibank S.A.',
    shortName: 'Agibank',
    primaryColor: '#FF6600',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#E55C00',
    gradientTo: '#FF7700',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/agibank.com.br',
  },
  '318': {
    code: '318',
    name: 'Banco BMG S.A.',
    shortName: 'BMG',
    primaryColor: '#FF6600',
    secondaryColor: '#003366',
    gradientFrom: '#E55C00',
    gradientTo: '#FF7700',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/bancobmg.com.br',
  },
  '745': {
    code: '745',
    name: 'Banco Citibank S.A.',
    shortName: 'Citi',
    primaryColor: '#003B70',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#003060',
    gradientTo: '#004D8C',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/citibank.com',
  },
  '197': {
    code: '197',
    name: 'Stone Pagamentos S.A.',
    shortName: 'Stone',
    primaryColor: '#00A868',
    secondaryColor: '#FFFFFF',
    gradientFrom: '#00A868',
    gradientTo: '#00C978',
    textColor: '#FFFFFF',
    logoUrl: 'https://logo.clearbit.com/stone.com.br',
  },
};

const defaultBrand: BankBrand = {
  code: '000',
  name: 'Banco',
  shortName: 'Banco',
  primaryColor: '#1D3557',
  secondaryColor: '#B59363',
  gradientFrom: '#1D3557',
  gradientTo: '#2B4A7A',
  textColor: '#FFFFFF',
  logoUrl: '',
};

export function getBankBranding(bankCode: string | undefined | null): BankBrand {
  if (!bankCode) return defaultBrand;

  // Busca direta por código
  if (bankBrands[bankCode]) {
    return bankBrands[bankCode];
  }

  // Fallback: busca por nome legado (contas cadastradas com código antigo tipo 'nubank', 'itau')
  const legacyMap: Record<string, string> = {
    'banco_do_brasil': '001',
    'santander': '033',
    'caixa': '104',
    'bradesco': '237',
    'itau': '341',
    'inter': '077',
    'nubank': '260',
    'original': '212',
    'c6': '336',
    'pagseguro': '290',
    'picpay': '380',
    'neon': '655',
    'safra': '422',
    'sicredi': '748',
    'sicoob': '756',
    'btg': '208',
    'pan': '623',
    'stone': '197',
  };

  const mappedCode = legacyMap[bankCode.toLowerCase()];
  if (mappedCode && bankBrands[mappedCode]) {
    return bankBrands[mappedCode];
  }

  return defaultBrand;
}

export function BankLogo({ bankCode, size = 24, className = '' }: { bankCode: string | undefined | null; size?: number; className?: string }) {
  const brand = getBankBranding(bankCode);

  if (brand.logoUrl) {
    return (
      <img
        src={brand.logoUrl}
        alt={brand.shortName}
        width={size}
        height={size}
        className={`rounded object-contain ${className}`}
        onError={(e) => {
          // Fallback: mostra iniciais se a logo falhar
          const target = e.currentTarget;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div
      className={`rounded flex items-center justify-center font-bold text-white text-[10px] ${className}`}
      style={{ width: size, height: size, backgroundColor: brand.primaryColor }}
    >
      {brand.shortName.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function BankLogoWithFallback({ bankCode, customLogoUrl, size = 24, className = '' }: { bankCode: string | undefined | null; customLogoUrl?: string | null; size?: number; className?: string }) {
  const brand = getBankBranding(bankCode);
  const effectiveLogoUrl = customLogoUrl || brand.logoUrl;

  return (
    <div className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
      {effectiveLogoUrl ? (
        <>
          <img
            src={effectiveLogoUrl}
            alt={brand.shortName}
            width={size}
            height={size}
            className="rounded object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div
            className="rounded items-center justify-center font-bold text-white text-[10px] hidden"
            style={{ width: size, height: size, backgroundColor: brand.primaryColor }}
          >
            {brand.shortName.slice(0, 2).toUpperCase()}
          </div>
        </>
      ) : (
        <div
          className="rounded flex items-center justify-center font-bold text-white text-[10px]"
          style={{ width: size, height: size, backgroundColor: brand.primaryColor }}
        >
          {brand.shortName.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
