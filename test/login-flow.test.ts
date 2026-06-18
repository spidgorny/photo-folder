import axios from 'axios';

const BASE_URL = 'https://photo-folder.vercel.app';

// Update this with an email from your allowed-users.json
const TEST_EMAIL = 'spidgorny@gmail.com';

async function testLoginFlow() {
	console.log('🧪 Testing Android Login Flow...\n');

	try {
		// Test 1: Login with email
		console.log('1. Testing POST /api/auth/login');
		const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
			email: TEST_EMAIL,
			provider: 'email',
		});

		console.log('✅ Login successful');
		console.log('Response:', {
			success: loginResponse.data.success,
			hasAccessToken: !!loginResponse.data.accessToken,
			hasRefreshToken: !!loginResponse.data.refreshToken,
			user: loginResponse.data.user,
		});

		if (!loginResponse.data.success) {
			throw new Error('Login response indicates failure');
		}

		if (!loginResponse.data.accessToken) {
			throw new Error('No access token in response');
		}

		if (!loginResponse.data.refreshToken) {
			throw new Error('No refresh token in response');
		}

		const { accessToken, refreshToken } = loginResponse.data;

		// Test 2: Verify token with /api/auth/me
		console.log('\n2. Testing GET /api/auth/me with access token');
		const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		console.log('✅ /api/auth/me successful');
		console.log('User data:', {
			email: meResponse.data.user?.email,
			hasFolders: Array.isArray(meResponse.data.folders),
			folderCount: meResponse.data.folders?.length || 0,
		});

		if (meResponse.data.user?.email !== TEST_EMAIL) {
			throw new Error('Email mismatch in /api/auth/me response');
		}

		// Test 3: Test refresh token
		console.log('\n3. Testing POST /api/auth/refresh');
		const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
			refreshToken,
		});

		console.log('✅ Token refresh successful');
		console.log('Response:', {
			hasNewAccessToken: !!refreshResponse.data.accessToken,
		});

		if (!refreshResponse.data.accessToken) {
			throw new Error('No new access token in refresh response');
		}

		console.log('\n✅ All tests passed!');
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error('\n❌ Test failed:');
			console.error('Status:', error.response?.status);
			console.error('Status Text:', error.response?.statusText);
			console.error('Data:', error.response?.data);
			console.error('URL:', error.config?.url);
		} else {
			console.error('\n❌ Test failed:', error);
		}
		process.exit(1);
	}
}

testLoginFlow();
