FROM gitpod/workspace-full:latest

RUN bash -c ". .nvm/nvm.sh && nvm install 14 && nvm use 14 && nvm alias default 14 && npm i"

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix
