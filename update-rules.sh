git clone --depth 1 -b meta https://github.com/MetaCubeX/meta-rules-dat ./meta-rules-dat-new
git clone --depth 1 -b release https://github.com/Chocolate4U/Iran-v2ray-rules ./Iran-v2ray-rules-new

mv meta-rules-dat meta-rules-dat-bak
mv meta-rules-dat-new meta-rules-dat

mv Iran-v2ray-rules Iran-v2ray-rules-bak
mv Iran-v2ray-rules-new Iran-v2ray-rules

rm -rf Iran-v2ray-rules-bak
rm -rf meta-rules-dat-bak