<template>
    <div class="container">
        <h1>QR Validation Page</h1>
        <p>Please scan the QR code with your authenticator app:</p>

        <div>
            <img :src="qrCodeUrl" alt="QR code" />
        </div>

        <div ref="qrcode"></div>
        <form @submit.prevent="submitCode">
            <div class="form-group">
                <label for="code">Enter the code from your app:</label>
                <input type="text" class="form-control" id="code" v-model="code" />
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    </div>
</template>

<script lang="ts">

import { apiClient } from '@/api/baseApi';
import { ENABLE_2FA_ENDPOINT, QR_ENDPOINT } from '@/config';
import { defineComponent } from 'vue';


export default defineComponent({
    name: "qr",
    data() {
        return {
            qrCodeUrl: '',
            code: ''
        }
    },
    mounted() {
        this.getQRCode();
    },
    methods: {
        async getQRCode() {
            const response = await apiClient.get(QR_ENDPOINT, { responseType: 'blob' });
            const qrCodeUrl = URL.createObjectURL(response.data);
            this.qrCodeUrl = qrCodeUrl;
        },

        async submitCode() {
            //Validate the user's code and redirect them to the appropriate page

            const response = await apiClient.post(ENABLE_2FA_ENDPOINT + "/" + this.code);
            
            if (response.status === 200) {
                this.$router.push('/');
            } else {
                alert('Invalid code, please try again.');
            }
        }
    }
});

</script>
  
<style>
.container {
    margin-top: 50px;
    text-align: center;
}
</style>
  