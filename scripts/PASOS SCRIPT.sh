# COMANDOS A UTILIZAR POR ORDEN EN LA INSTALACIÓN

# EDICION FICHERO /etc/network/interfaces

/etc/init.d/networking restart

sudo apt-get install -y --force-yes debconf-utils

echo 'mysql-server mysql-server/root_password password CONTRASEÑA' | debconf-set-selections
echo 'mysql-server mysql-server/root_password_again password CONTRASEÑA' | debconf-set-selections

sudo apt-get install -y --force-yes debhelper libssl-dev libcurl4-gnutls-dev mysql-server freeradius freeradius-mysql gcc make libnl1 libnl-dev pkg-config iptables

echo 'create database radius' | mysql -u root -p CONTRASEÑA

mysql -u root -p CONTRASEÑA radius < /etc/freeradius/sql/mysql/schema.sql
mysql -u root -p CONTRASEÑA radius < /etc/freeradius/sql/mysql/admin.sql
mysql -u root -p CONTRASEÑA radius < /etc/freeradius/sql/mysql/nas.sql

service freeradius stop

freeradius -C
service freeradius start

apt-get install -y --force-yes git libjson-c-dev haserl gengetopt devscripts libtool bash-completion autoconf automake

cd /usr/src
git clone https://github.com/coova/coova-chilli.git

cd /usr/src/coova-chilli
dpkg-buildpackage -us -uc

cd /usr/src
dpkg -i coova-chilli_1.3.0_armhf.deb

iptables -I POSTROUTING -t nat -o $HS_WANIF -j MASQUERADE

HS_WANIF=eth0
HS_LANIF=wlan0
HS_NETWORK=192.168.10.0
HS_UAMLISTEN=192.168.10.1
HS_UAMALLOW=192.168.10.0
HS_SSID=RasPiDav
HS_COAPORT=3799
HS_UAMSECRET=

cd /usr/src
wget http://downloads.sourceforge.net/project/haserl/haserl-devel/haserl-0.9.35.tar.gz
tar zxvf  haserl-0.9.35.tar.gz
cd /usr/src/haserl-0.9.35
./configure
make
make install

service chilli start

apt-get install -y --force-yes hostapd

DAEMON_CONF="/etc/hostapd/hostapd.conf"

interface=wlan0
driver=nl80211
ssid=RasPiDav
hw_mode=g
channel=6
auth_algs=1
beacon_int=100
dtim_period=2
max_num_sta=255
rts_threshold=2347
fragm_threshold=2346
ieee80211n=1
wmm_enabled=1
ht_capab=[HT40][SHORT-GI-20][DSSS_CCK-40]

service hostapd start

apt-get install -y --force-yes php5-mysql php-pear php5-gd php-db php5-fpm libgd2-xpm-dev libpcrecpp0 libxpm4 nginx php5-xcache

cd /usr/src
wget https://sourceforge.net/projects/daloradius/files/latest/download
tar zxvf download -C /usr/share/nginx/html/
mv /usr/share/nginx/html/daloradius-0.9-9 /usr/share/nginx/html/daloradius

service freeradius stop
cp /usr/share/nginx/html/daloradius/contrib/configs/freeradius-2.1.8/cfg1/raddb/sql/mysql/counter.conf /etc/freeradius/sql/mysql/counter.conf
cp /usr/share/nginx/html/daloradius/contrib/configs/freeradius-2.1.8/cfg1/raddb/sites-available/default /etc/freeradius/sites-available/default
cp /usr/share/nginx/html/daloradius/contrib/configs/freeradius-2.1.8/cfg1/raddb/modules/sql.conf /etc/freeradius/sql.conf

service freeradius start
mysql -u root -p CONTRASEÑA radius < /usr/share/nginx/html/daloradius/contrib/db/fr2-mysql-daloradius-and-freeradius.sql
echo "GRANT ALL ON radius.* to 'radius'@'localhost';" > /tmp/grant.sql
echo "GRANT ALL ON radius.* to 'radius'@'127.0.0.1';" >> /tmp/grant.sql
mysql -u root -p CONTRASEÑA < /tmp/grant.sql

$configValues['CONFIG_DB_USER'] = 'radius';
$configValues['CONFIG_DB_PASS'] = 'CONTRASEÑA-RADIUS';

server {
           listen 80 default_server;
           listen [::]:80 default_server;
           root /usr/share/nginx/html;
           index index.html index.htm index.php;
           server_name _;
           location / {
               try_files $uri $uri/ =404;
           }
           location ~ \.php$ {
               include snippets/fastcgi-php.conf;
               fastcgi_pass unix:/var/run/php5-fpm.sock;
           }
}

nginx -t
service nginx restart
service hostapd restart

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

git clone CAPTIVEPORTAL

