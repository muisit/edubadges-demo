<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';

interface Credential {
    id: string;
    name:string;
}
const credentials:Ref<Credential[]> = ref([]);
onMounted(() => {
    fetch(import.meta.env.VITE_BASE_URL + '/list')
        .then(r => r.json())
        .then((r) => {
            console.log(r);
            if (r && Object.keys(r).length) {
                credentials.value = [];
                for (const key of Object.keys(r)) {
                    const cred = r[key];
                    credentials.value.push({id:key, name:cred as string});
                }
                console.log(credentials.value);
            }
        });
})

const selectedCred:Credential|null = ref(null);
const sessionid = ref('');
const url = ref('');

function unselect() {
    selectedCred.value = null;
}

function selectCred(cred)
{
    selectedCred.value = cred;
    fetch(import.meta.env.VITE_BASE_URL + '/offer', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + import.meta.env.VITE_BEARER_TOKEN,
            'Content-type':'application/json'
        },
        body: JSON.stringify({"badge": cred.id})
    })
        .then(r => r.json())
        .then((r) => {
            sessionid.value = r.session;
            url.value = r.url;


        });
}
import QrcodeVue from 'qrcode.vue'
</script>
<template>
    <el-container class="main">
        <el-header>Edubadges Authorization Flow Demo</el-header>
        <el-container>
            <el-main>
                <div v-if="selectedCred == null" class="itemlist">
                    <button class='item' v-for="cred in credentials" :key="cred.id" @click="() => selectCred(cred)">{{ cred.name }}</button>
                </div>
                <div v-else class="credential">
                    <div class="header">Selected Credential: {{  selectedCred.id }}: {{ selectedCred.name }}</div>
                    <div class='canvas'><qrcode-vue :value="url" :size="300"></qrcode-vue></div>
                    <div class="url">{{ url }}</div>
                    <button @click="unselect">Back</button>
                </div>
            </el-main>
        </el-container>
        <el-footer>
        </el-footer>
    </el-container>
</template>