<template>
    <div class="registerBox">
        <md-card class="registerCard">
            <md-card-media-actions>
                <md-card-media>
                    <img src="@/assets/images/garnbarn-logo.png" class="garnbarnLogo" />
                </md-card-media>

                <md-card-actions>
                    <h3>Register to GarnBarn</h3>
                    <div>
                        <form @submit.prevent="register">
                            <div class="user">
                                <label for="username">Name - Surname:</label>
                                <input id="username" v-model="username" type="text" />
                            </div>
                            <div class="user">
                                <label for="username">Email:</label>
                                <input id="username" v-model="email" type="text" />
                            </div>
                            <div class="pass">
                                <label for="password">Password:</label>
                                <input id="password" v-model="password" type="password" />
                            </div>
                            <div class="con-pass">
                                <label for="confirmPassword">Confirm Password:</label>
                                <input id="confirmPassword" v-model="confirmPassword" type="password" />
                            </div>
                            <div>
                                <button type="submit">Register</button>
                            </div>
                        </form>
                    </div>
                </md-card-actions>
            </md-card-media-actions>
        </md-card>
    </div>
</template>

<script lang="ts">
import firebase from "firebase";
import { Vue, Component } from 'vue-property-decorator';
import GarnBarnApiConfig from "@/GarnBarnApiConfig.json";
import axios from 'axios';
import sha1 from 'sha1';

@Component
export default class Register extends Vue {
    username = '';
    password = '';
    confirmPassword = '';
    email = ''

    async checkCompromisedPassword(): Promise<boolean | undefined> {
        const hashedPassword: string = sha1(this.password);
        try {
            const response = await axios.post(`${GarnBarnApiConfig.apiPrefix}/api/v1/account/compromised`, { hashedPassword });
            if (response.status == 200) {
                return false;
            }
        } catch (error: any) {
            if (error.response.status == 302) {
                return true;
            }
            return undefined
        }
        return true
    }

    async register(): Promise<void> {
        const checkingPasssowrd = await this.checkCompromisedPassword()
        if (checkingPasssowrd) {
            alert('Your passoword is compromised')
            return
        }
        else if (checkingPasssowrd == undefined) {
            alert('An error occurred while checking the password.');
            return
        }
        if (this.password !== this.confirmPassword) {
            alert('Password and Confirm Password missmatched')
            return
        }
        firebase
            .auth()
            .createUserWithEmailAndPassword(this.email, this.password)
            .then((res) => {
                res.user!
                    .updateProfile({
                        displayName: this.username
                    })
                    .then(() => {
                        this.$router.push('/login')
                    });
            })
            .catch((error) => {
                alert(error.message);
            });
    }
}
</script>

<style scoped>
.registerBox {
    padding-top: 5%;
    padding-top: 5%;
}

.registerCard {
    padding: 10px;
    padding-top: 15px;
    border-radius: 20px;
    background-color: #f9f9f9;
    display: inline-block;
    vertical-align: top;
    overflow: auto;
    border: 1px solid rgba(#000, 0.12);
}

.garnbarnLogo {
    width: 150px;
    height: auto;
}

hr.rounded {
    margin-top: 5%;
    margin-bottom: 5%;
    margin-left: 10%;
    margin-right: 10%;
    border-top: 2px solid #bbb;
    border-radius: 5px;
}

.ruser,
.pass,
.con-pass {
    margin: 0.25rem;
}

.ruser,
.pass,
.con-pass {
    margin: 0.25rem;
}

.ruser,
.pass,
.con-pass {
    margin: 0.25rem;
}
</style>
