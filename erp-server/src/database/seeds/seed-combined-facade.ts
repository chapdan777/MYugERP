/**
 * Seed-скрипт для создания тестовых данных комбинированного фасада.
 * Запуск: npx ts-node src/database/seeds/seed-combined-facade.ts
 * 
 * Создаёт:
 * 1. ДС (свойства): P1, P2, P3, P4, GP, PP, Позиция_перемычки
 * 2. Компоненты: Профиль 70мм, Профиль-перемычка, Филенка стандарт, Рубашка 4мм
 * 3. Фасады: Фасад глухой, Фасад комби 2 филенки
 * 4. Деталировка для каждого фасада
 */

import * as http from 'http';

const API_HOST = 'localhost';
const API_PORT = 3004;
let token = '';

/** HTTP-запрос без axios */
function apiRequest(method: string, path: string, body?: unknown): Promise<any> {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : undefined;
        const options: http.RequestOptions = {
            hostname: API_HOST,
            port: API_PORT,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
            },
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => (responseData += chunk));
            res.on('end', () => {
                try {
                    const parsed = responseData ? JSON.parse(responseData) : {};
                    if (res.statusCode && res.statusCode >= 400) {
                        reject({ status: res.statusCode, data: parsed });
                    } else {
                        resolve(parsed);
                    }
                } catch {
                    resolve(responseData);
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

/** Авторизация */
async function login(): Promise<void> {
    const res = await apiRequest('POST', '/api/auth/login', {
        username: 'admin',
        password: 'admin123',
    });
    token = res.accessToken || res.access_token;
    console.log('✅ Авторизация успешна');
}

/** Создание свойства (ДС) */
async function createProperty(data: {
    code: string;
    name: string;
    dataType: string;
    variableName: string;
    defaultValue?: string;
}): Promise<number> {
    try {
        const res = await apiRequest('POST', '/api/properties', {
            code: data.code,
            name: data.name,
            dataType: data.dataType,
            variableName: data.variableName,
            defaultValue: data.defaultValue || null,
            isRequired: false,
            displayOrder: 0,
        });
        console.log(`  ✅ Свойство "${data.name}" создано (id=${res.id})`);
        return res.id;
    } catch (e: any) {
        console.log(`  ⚠️  Свойство "${data.name}" — ищем существующее...`);
        const all = await apiRequest('GET', '/api/properties/all');
        const existing = all.find((p: any) => p.code === data.code);
        if (existing) {
            console.log(`  ↳ Найдено (id=${existing.id})`);
            return existing.id;
        }
        throw e;
    }
}

/** Создание продукта */
async function createProduct(data: {
    name: string;
    code: string;
    category: string;
    description?: string;
    basePrice: number;
    unit: string;
    defaultLength?: number;
    defaultWidth?: number;
    defaultDepth?: number;
}): Promise<number> {
    try {
        const res = await apiRequest('POST', '/api/products', data);
        console.log(`  ✅ Номенклатура "${data.name}" создана (id=${res.id})`);
        return res.id;
    } catch (e: any) {
        console.log(`  ⚠️  Номенклатура "${data.name}" — ищем существующее...`);
        const all = await apiRequest('GET', '/api/products');
        const existing = all.find((p: any) => p.code === data.code);
        if (existing) {
            console.log(`  ↳ Найдено (id=${existing.id})`);
            return existing.id;
        }
        console.error(`  ❌ Ошибка создания "${data.name}":`, e.data || e);
        throw e;
    }
}

/** Привязка свойств к продукту */
async function setProductProperties(productId: number, properties: Array<{
    propertyId: number;
    defaultValue?: string;
    displayOrder?: number;
}>): Promise<void> {
    try {
        await apiRequest('POST', `/api/products/${productId}/properties`, {
            properties: properties.map((p, i) => ({
                propertyId: p.propertyId,
                isRequired: false,
                displayOrder: p.displayOrder ?? i,
                defaultValue: p.defaultValue ?? null,
                isActive: true,
            })),
        });
        console.log(`  ✅ ${properties.length} свойств привязано`);
    } catch (e: any) {
        console.error(`  ❌ Ошибка привязки свойств:`, e.data || e);
    }
}

/** Создание схемы компонента (деталировка) */
async function createComponentSchema(data: {
    productId: number;
    childProductId?: number;
    name: string;
    lengthFormula: string;
    widthFormula: string;
    quantityFormula: string;
    depthFormula?: string;
    extraVariables?: Record<string, string>;
    conditionFormula?: string;
    sortOrder?: number;
}): Promise<void> {
    try {
        await apiRequest('POST', '/api/production/schemas', data);
        console.log(`  ✅ Компонент "${data.name}" добавлен`);
    } catch (e: any) {
        console.error(`  ❌ Ошибка деталировки "${data.name}":`, e.data || e);
    }
}

async function main() {
    console.log('\n🏭 Seed: Создание тестовых данных для комбинированного фасада\n');

    await login();

    // === ДС (СВОЙСТВА) ===
    console.log('\n📋 Создание свойств...');
    const propP1 = await createProperty({ code: 'PROFILE_W1', name: 'Ширина профиля 1 (P1)', dataType: 'number', variableName: 'P1', defaultValue: '70' });
    const propP2 = await createProperty({ code: 'PROFILE_W2', name: 'Ширина профиля 2 (P2)', dataType: 'number', variableName: 'P2', defaultValue: '70' });
    const propP3 = await createProperty({ code: 'PROFILE_W3', name: 'Ширина профиля 3 (P3)', dataType: 'number', variableName: 'P3', defaultValue: '70' });
    const propP4 = await createProperty({ code: 'PROFILE_W4', name: 'Ширина профиля 4 (P4)', dataType: 'number', variableName: 'P4', defaultValue: '70' });
    const propGP = await createProperty({ code: 'GROOVE_DEPTH', name: 'Глубина паза (ГП)', dataType: 'number', variableName: 'GP', defaultValue: '10' });
    const propPP = await createProperty({ code: 'CROSS_PROFILE_W', name: 'Ширина перемычки (ПП)', dataType: 'number', variableName: 'PP', defaultValue: '70' });
    const propPos = await createProperty({ code: 'JUMPER_POS', name: 'Позиция перемычки (мм от низа)', dataType: 'number', variableName: 'POS_PEREM', defaultValue: '500' });

    // === КОМПОНЕНТЫ ===
    console.log('\n📦 Создание компонентов...');
    const profId = await createProduct({ name: 'Профиль 70мм', code: 'PROF-70', category: 'semifinished', description: 'Базовый профиль для фасадов', basePrice: 150, unit: 'п.м', defaultWidth: 70, defaultDepth: 20 });
    const profPeremId = await createProduct({ name: 'Профиль-перемычка', code: 'PROF-PEREM', category: 'semifinished', description: 'Промежуточный поперечный профиль', basePrice: 150, unit: 'п.м', defaultWidth: 70, defaultDepth: 20 });
    const filId = await createProduct({ name: 'Филенка стандарт', code: 'FIL-STD', category: 'semifinished', description: 'Стандартная филенка', basePrice: 500, unit: 'шт' });
    const rubId = await createProduct({ name: 'Рубашка 4мм', code: 'RUB-4', category: 'semifinished', description: 'Шпоновая рубашка 4мм', basePrice: 200, unit: 'шт' });

    // === ФАСАДЫ ===
    console.log('\n🚪 Создание фасадов...');
    const fasGlId = await createProduct({ name: 'Фасад глухой (ТЕСТ)', code: 'FAS-GL-TEST', category: 'facades', description: '4 профиля + 1 филенка', basePrice: 3000, unit: 'шт', defaultLength: 716, defaultWidth: 396, defaultDepth: 20 });
    const fasKombiId = await createProduct({ name: 'Фасад комби 2 филенки (ТЕСТ)', code: 'FAS-KOMBI2-TEST', category: 'facades', description: '4 профиля + перемычка + 2 филенки', basePrice: 4500, unit: 'шт', defaultLength: 1200, defaultWidth: 396, defaultDepth: 20 });

    // === СВОЙСТВА → ФАСАДЫ ===
    console.log('\n🔗 Привязка свойств...');
    const facadeProps = [
        { propertyId: propP1, defaultValue: '70', displayOrder: 0 },
        { propertyId: propP2, defaultValue: '70', displayOrder: 1 },
        { propertyId: propP3, defaultValue: '70', displayOrder: 2 },
        { propertyId: propP4, defaultValue: '70', displayOrder: 3 },
        { propertyId: propGP, defaultValue: '10', displayOrder: 4 },
    ];
    console.log('  Фасад глухой:');
    await setProductProperties(fasGlId, facadeProps);
    console.log('  Фасад комби:');
    await setProductProperties(fasKombiId, [...facadeProps, { propertyId: propPP, defaultValue: '70', displayOrder: 5 }, { propertyId: propPos, defaultValue: '500', displayOrder: 6 }]);

    // === ДЕТАЛИРОВКА: ФАСАД ГЛУХОЙ ===
    console.log('\n🔧 Деталировка: Фасад глухой...');
    await createComponentSchema({ productId: fasGlId, childProductId: profId, name: 'Профиль 1 (верхний)', lengthFormula: 'W', widthFormula: 'P1', quantityFormula: '1', sortOrder: 0 });
    await createComponentSchema({ productId: fasGlId, childProductId: profId, name: 'Профиль 2 (левый)', lengthFormula: 'H', widthFormula: 'P2', quantityFormula: '1', sortOrder: 1 });
    await createComponentSchema({ productId: fasGlId, childProductId: profId, name: 'Профиль 3 (нижний)', lengthFormula: 'W', widthFormula: 'P3', quantityFormula: '1', sortOrder: 2 });
    await createComponentSchema({ productId: fasGlId, childProductId: profId, name: 'Профиль 4 (правый)', lengthFormula: 'H', widthFormula: 'P4', quantityFormula: '1', sortOrder: 3 });
    await createComponentSchema({ productId: fasGlId, childProductId: filId, name: 'Филенка', lengthFormula: 'H - (P2 + P4) + GP * 2', widthFormula: 'W - (P1 + P3) + GP * 2', quantityFormula: '1', sortOrder: 4 });

    // === ДЕТАЛИРОВКА: ФАСАД КОМБИ ===
    console.log('\n🔧 Деталировка: Фасад комби 2 филенки...');
    await createComponentSchema({ productId: fasKombiId, childProductId: profId, name: 'Профиль 1 (верхний)', lengthFormula: 'W', widthFormula: 'P1', quantityFormula: '1', sortOrder: 0 });
    await createComponentSchema({ productId: fasKombiId, childProductId: profId, name: 'Профиль 2 (левый)', lengthFormula: 'H', widthFormula: 'P2', quantityFormula: '1', sortOrder: 1 });
    await createComponentSchema({ productId: fasKombiId, childProductId: profId, name: 'Профиль 3 (нижний)', lengthFormula: 'W', widthFormula: 'P3', quantityFormula: '1', sortOrder: 2 });
    await createComponentSchema({ productId: fasKombiId, childProductId: profId, name: 'Профиль 4 (правый)', lengthFormula: 'H', widthFormula: 'P4', quantityFormula: '1', sortOrder: 3 });
    await createComponentSchema({ productId: fasKombiId, childProductId: profPeremId, name: 'Профиль-перемычка', lengthFormula: 'W', widthFormula: 'PP', quantityFormula: '1', sortOrder: 4 });
    await createComponentSchema({ productId: fasKombiId, childProductId: filId, name: 'Филенка нижняя', lengthFormula: 'POS_PEREM - P4 + GP * 2 - PP / 2', widthFormula: 'W - (P1 + P3) + GP * 2', quantityFormula: '1', sortOrder: 5 });
    await createComponentSchema({ productId: fasKombiId, childProductId: filId, name: 'Филенка верхняя', lengthFormula: 'H - POS_PEREM - P2 + GP * 2 - PP / 2', widthFormula: 'W - (P1 + P3) + GP * 2', quantityFormula: '1', sortOrder: 6 });

    console.log('\n✅ Seed завершён!\n');
    console.log(`   Профиль 70мм:          id=${profId}`);
    console.log(`   Профиль-перемычка:      id=${profPeremId}`);
    console.log(`   Филенка стандарт:       id=${filId}`);
    console.log(`   Рубашка 4мм:            id=${rubId}`);
    console.log(`   Фасад глухой:           id=${fasGlId}`);
    console.log(`   Фасад комби 2 филенки:  id=${fasKombiId}`);
}

main().catch(err => { console.error('❌ Ошибка:', err.data || err); process.exit(1); });
